// Onboarding reminders. Two modes:
//   - cron: scans all eligible users (daily fallback)
//   - event: triggered from the Dashboard for a single user
// Respects per-user settings (delay, max, role/persona toggles, custom copy).
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const DASHBOARD_BASE = 'https://brand-in-a-box.space'
const MIN_AGE_HOURS = 24

interface StepDef { key: string; label: string; description: string; href: string }

function pickBlockedStep(ctx: any): StepDef | null {
  if (!ctx.hasProfileBasics || !ctx.hasMarket || !ctx.hasBusinessType)
    return { key: 'profile', label: 'Compléter votre profil',
      description: "Renseignez votre nom, marché cible et type d'activité.",
      href: `${DASHBOARD_BASE}/dashboard/parametres` }
  if (!ctx.hasBoutique)
    return { key: 'boutique', label: 'Créer votre première boutique',
      description: 'Choisissez un nom, une catégorie et un slug public.',
      href: `${DASHBOARD_BASE}/dashboard/boutiques/create` }
  if (!ctx.hasProduct)
    return { key: 'product', label: 'Importer un premier produit',
      description: 'Sélectionnez depuis le catalogue fournisseur validé.',
      href: `${DASHBOARD_BASE}/dashboard/produits-fournisseurs` }
  if (ctx.isBusiness && !ctx.isVerified)
    return { key: 'kyc', label: 'Téléverser vos documents KYC',
      description: 'Obligatoire pour activer un compte business.',
      href: `${DASHBOARD_BASE}/dashboard/parametres` }
  if (!ctx.hasPublishedBoutique)
    return { key: 'publish', label: 'Publier votre boutique',
      description: 'Rendez votre vitrine accessible publiquement.',
      href: `${DASHBOARD_BASE}/dashboard/boutiques` }
  return null
}

async function processUser(sb: any, userId: string, source: string) {
  // Settings (defaults if no row)
  const { data: s } = await sb
    .from('onboarding_reminders_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  const settings = {
    enabled: s?.enabled ?? true,
    delay_hours: s?.delay_hours ?? 48,
    max_reminders: s?.max_reminders ?? 3,
    role_seller_enabled: s?.role_seller_enabled ?? true,
    role_team_enabled: s?.role_team_enabled ?? true,
    persona_seller_enabled: s?.persona_seller_enabled ?? true,
    persona_team_enabled: s?.persona_team_enabled ?? true,
    custom_subject: s?.custom_subject ?? null,
    custom_preheader: s?.custom_preheader ?? null,
    custom_cta_label: s?.custom_cta_label ?? null,
    per_step_rules: (s?.per_step_rules ?? {}) as Record<string, { delay_hours?: number | null; max_reminders?: number | null; enabled?: boolean }>,
  }

  const logSkip = async (
    stepKey: string, stepLabel: string | null, status: string,
    extra: { detail?: string; role?: string | null; next_attempt_at?: string | null } = {},
  ) => {
    await sb.from('onboarding_reminders_log').insert({
      user_id: userId, step_key: stepKey, attempt_no: 0,
      status, source, step_label: stepLabel,
      detail: extra.detail ?? null,
      role: extra.role ?? null,
      next_attempt_at: extra.next_attempt_at ?? null,
    })
  }

  if (!settings.enabled) { await logSkip('-', null, 'skipped:disabled'); return 'skipped:disabled' }

  // Profile + role
  const { data: p } = await sb
    .from('profiles')
    .select('user_id, full_name, market, business_type, is_verified, created_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (!p) return 'skipped:no_profile'

  // Role: is user a team member of any boutique?
  const { data: members } = await sb
    .from('boutique_members')
    .select('id').eq('user_id', userId).limit(1)
  const isTeam = (members?.length ?? 0) > 0
  const isSeller = !isTeam
  const roleStr = isTeam ? 'team' : 'seller'

  if (isSeller && !settings.role_seller_enabled) { await logSkip('-', null, 'skipped:role', { role: roleStr }); return 'skipped:role' }
  if (isTeam && !settings.role_team_enabled) { await logSkip('-', null, 'skipped:role', { role: roleStr }); return 'skipped:role' }
  // persona = same as role here (seller vs team)
  if (isSeller && !settings.persona_seller_enabled) { await logSkip('-', null, 'skipped:persona', { role: roleStr }); return 'skipped:persona' }
  if (isTeam && !settings.persona_team_enabled) { await logSkip('-', null, 'skipped:persona', { role: roleStr }); return 'skipped:persona' }

  // Age check (24h after signup) — only for cron fallback; event mode can fire sooner if already overdue
  const ageMs = Date.now() - new Date(p.created_at).getTime()
  if (source === 'cron' && ageMs < MIN_AGE_HOURS * 3600_000) return 'skipped:too_recent'

  // Build context
  const { data: boutiques } = await sb.from('boutiques').select('id, status').eq('user_id', userId)
  const hasBoutique = (boutiques?.length ?? 0) > 0
  const hasPublishedBoutique = (boutiques ?? []).some((b: any) => b.status === 'published')
  let hasProduct = false
  if (hasBoutique) {
    const ids = (boutiques ?? []).map((b: any) => b.id)
    const { data: products } = await sb.from('products').select('id').in('boutique_id', ids).limit(1)
    hasProduct = (products?.length ?? 0) > 0
  }
  const ctx = {
    hasProfileBasics: !!p.full_name,
    hasMarket: !!p.market,
    hasBusinessType: !!p.business_type,
    hasBoutique, hasProduct, hasPublishedBoutique,
    isBusiness: p.business_type === 'business',
    isVerified: !!p.is_verified,
  }
  const step = pickBlockedStep(ctx)
  if (!step) return 'skipped:nothing_blocked'

  // Per-step rule overrides
  const rule = settings.per_step_rules?.[step.key] ?? {}
  const effDelay = Math.max(1, Math.min(720, Number(rule.delay_hours ?? settings.delay_hours)))
  const effMax = Math.max(1, Math.min(10, Number(rule.max_reminders ?? settings.max_reminders)))
  if (rule.enabled === false) {
    await logSkip(step.key, step.label, 'skipped:step_disabled', { role: roleStr })
    return 'skipped:step_disabled'
  }

  // Throttle
  const { data: log } = await sb
    .from('onboarding_reminders_log')
    .select('id, sent_at, attempt_no, status')
    .eq('user_id', userId).eq('step_key', step.key)
    .eq('status', 'sent')
    .order('sent_at', { ascending: false }).limit(effMax)
  const sentCount = log?.length ?? 0
  if (sentCount >= effMax) {
    await logSkip(step.key, step.label, 'max_reached', { role: roleStr })
    return 'max_reached'
  }
  const lastSent = log?.[0]?.sent_at
  if (lastSent) {
    const sinceMs = Date.now() - new Date(lastSent).getTime()
    if (sinceMs < effDelay * 3600_000) {
      const next = new Date(new Date(lastSent).getTime() + effDelay * 3600_000).toISOString()
      await logSkip(step.key, step.label, 'skipped:throttle', {
        role: roleStr,
        next_attempt_at: next,
        detail: `Délai ${effDelay}h non écoulé`,
      })
      return 'skipped:throttle'
    }
  }

  const { data: userRes } = await sb.auth.admin.getUserById(userId)
  const email = userRes?.user?.email
  if (!email) { await logSkip(step.key, step.label, 'failed', { role: roleStr, detail: 'no_email' }); return 'failed' }

  const attemptNo = sentCount + 1
  const totalSteps = ctx.isBusiness ? 5 : 4
  const doneSteps = [
    ctx.hasProfileBasics && ctx.hasMarket && ctx.hasBusinessType,
    ctx.hasBoutique, ctx.hasProduct,
    ctx.isBusiness ? ctx.isVerified : null,
    ctx.hasPublishedBoutique,
  ].filter((v) => v === true).length

  const { error: sendErr } = await sb.functions.invoke('send-transactional-email', {
    body: {
      templateName: 'onboarding-stuck-reminder',
      recipientEmail: email,
      idempotencyKey: `onboarding-reminder-${userId}-${step.key}-${attemptNo}`,
      templateData: {
        name: p.full_name || undefined,
        stepLabel: step.label, stepDescription: step.description, stepUrl: step.href,
        attemptNo, totalSteps, doneSteps,
        customSubject: settings.custom_subject || undefined,
        customPreheader: settings.custom_preheader || undefined,
        customCtaLabel: settings.custom_cta_label || undefined,
      },
    },
  })
  if (sendErr) {
    await logSkip(step.key, step.label, 'failed', { role: roleStr, detail: sendErr.message })
    return 'failed'
  }
  const nextAttempt = attemptNo < effMax
    ? new Date(Date.now() + effDelay * 3600_000).toISOString()
    : null
  await sb.from('onboarding_reminders_log').insert({
    user_id: userId, step_key: step.key, attempt_no: attemptNo,
    status: 'sent', source, step_label: step.label,
    role: roleStr, next_attempt_at: nextAttempt,
    detail: `Délai ${effDelay}h · max ${effMax}`,
  })
  return 'sent'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const sb = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } })
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {}
    const source = body.source === 'event' ? 'event' : 'cron'

    if (body.user_id && typeof body.user_id === 'string') {
      const result = await processUser(sb, body.user_id, source)
      return json({ user_id: body.user_id, result })
    }

    // cron scan
    const cutoff = new Date(Date.now() - MIN_AGE_HOURS * 3600_000).toISOString()
    const { data: profiles } = await sb
      .from('profiles').select('user_id').lt('created_at', cutoff).limit(500)
    let sent = 0, scanned = 0
    for (const p of (profiles ?? []) as any[]) {
      scanned++
      const r = await processUser(sb, p.user_id, 'cron')
      if (r === 'sent') sent++
    }
    return json({ scanned, sent })
  } catch (e) {
    console.error('onboarding-reminders error', e)
    return json({ error: (e as Error).message }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
