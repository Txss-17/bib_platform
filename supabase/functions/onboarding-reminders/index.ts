// Scans profiles with incomplete onboarding and sends transactional reminders
// for the first blocked step. Throttled to one reminder per step every 48h,
// max 3 reminders per step. Respects per-user opt-out (onboarding_reminders_settings).
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const DASHBOARD_BASE = 'https://brand-in-a-box.space'

const MIN_AGE_HOURS = 24      // wait at least 24h after signup before first reminder
const REPEAT_HOURS = 48       // 48h between successive reminders for the same step
const MAX_ATTEMPTS = 3        // max 3 reminders per blocked step

interface StepDef {
  key: string
  label: string
  description: string
  href: string
}

function pickBlockedStep(ctx: {
  hasProfileBasics: boolean
  hasMarket: boolean
  hasBusinessType: boolean
  hasBoutique: boolean
  hasProduct: boolean
  hasPublishedBoutique: boolean
  isBusiness: boolean
  isVerified: boolean
}): StepDef | null {
  if (!ctx.hasProfileBasics || !ctx.hasMarket || !ctx.hasBusinessType) {
    return {
      key: 'profile',
      label: 'Compléter votre profil',
      description: "Renseignez votre nom, votre marché cible et votre type d'activité.",
      href: `${DASHBOARD_BASE}/dashboard/parametres`,
    }
  }
  if (!ctx.hasBoutique) {
    return {
      key: 'boutique',
      label: 'Créer votre première boutique',
      description: 'Choisissez un nom, une catégorie et un slug public.',
      href: `${DASHBOARD_BASE}/dashboard/boutiques/create`,
    }
  }
  if (!ctx.hasProduct) {
    return {
      key: 'product',
      label: 'Importer un premier produit',
      description: 'Sélectionnez depuis le catalogue fournisseur validé.',
      href: `${DASHBOARD_BASE}/dashboard/produits-fournisseurs`,
    }
  }
  if (ctx.isBusiness && !ctx.isVerified) {
    return {
      key: 'kyc',
      label: 'Téléverser vos documents KYC',
      description: 'Obligatoire pour activer un compte business (SIRET, justificatif).',
      href: `${DASHBOARD_BASE}/dashboard/parametres`,
    }
  }
  if (!ctx.hasPublishedBoutique) {
    return {
      key: 'publish',
      label: 'Publier votre boutique',
      description: 'Rendez votre vitrine accessible publiquement.',
      href: `${DASHBOARD_BASE}/dashboard/boutiques`,
    }
  }
  return null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const sb = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } })
    const cutoffOld = new Date(Date.now() - MIN_AGE_HOURS * 3600_000).toISOString()
    const repeatCutoff = new Date(Date.now() - REPEAT_HOURS * 3600_000).toISOString()

    // 1) Candidate profiles: created at least MIN_AGE_HOURS ago.
    const { data: profiles, error: pErr } = await sb
      .from('profiles')
      .select('user_id, full_name, market, business_type, is_verified, created_at')
      .lt('created_at', cutoffOld)
      .limit(500)
    if (pErr) throw pErr
    if (!profiles?.length) return json({ scanned: 0, sent: 0 })

    const userIds = profiles.map((p: any) => p.user_id)

    // 2) Bulk-fetch related state.
    const [{ data: boutiques }, { data: products }, { data: settings }] = await Promise.all([
      sb.from('boutiques').select('user_id, status').in('user_id', userIds),
      sb.from('products').select('boutique_id'),
      sb.from('onboarding_reminders_settings').select('user_id, enabled').in('user_id', userIds),
    ])

    const disabledSet = new Set(
      (settings ?? []).filter((s: any) => s.enabled === false).map((s: any) => s.user_id),
    )

    const boutiquesByUser = new Map<string, { ids: string[]; published: boolean }>()
    for (const b of boutiques ?? []) {
      const entry = boutiquesByUser.get(b.user_id) ?? { ids: [], published: false }
      entry.ids.push(b.id ?? '')
      if (b.status === 'published') entry.published = true
      boutiquesByUser.set(b.user_id, entry)
    }

    // Need boutique IDs for product mapping
    const { data: boutiquesFull } = await sb
      .from('boutiques')
      .select('id, user_id')
      .in('user_id', userIds)
    const userByBoutique = new Map<string, string>()
    for (const b of boutiquesFull ?? []) userByBoutique.set(b.id, b.user_id)
    const usersWithProduct = new Set<string>()
    for (const p of products ?? []) {
      const uid = userByBoutique.get(p.boutique_id)
      if (uid) usersWithProduct.add(uid)
    }

    // 3) For each profile, derive blocked step + check throttle.
    let sent = 0
    let scanned = 0

    for (const p of profiles as any[]) {
      scanned++
      if (disabledSet.has(p.user_id)) continue

      const userBoutiques = boutiquesByUser.get(p.user_id) ?? { ids: [], published: false }
      const ctx = {
        hasProfileBasics: !!p.full_name,
        hasMarket: !!p.market,
        hasBusinessType: !!p.business_type,
        hasBoutique: userBoutiques.ids.length > 0,
        hasProduct: usersWithProduct.has(p.user_id),
        hasPublishedBoutique: userBoutiques.published,
        isBusiness: p.business_type === 'business',
        isVerified: !!p.is_verified,
      }
      const step = pickBlockedStep(ctx)
      if (!step) continue

      // Throttle: count attempts in last 14 days for this step.
      const { data: log } = await sb
        .from('onboarding_reminders_log')
        .select('id, sent_at, attempt_no')
        .eq('user_id', p.user_id)
        .eq('step_key', step.key)
        .order('sent_at', { ascending: false })
        .limit(MAX_ATTEMPTS)

      const attemptCount = log?.length ?? 0
      if (attemptCount >= MAX_ATTEMPTS) continue
      if (log?.[0]?.sent_at && log[0].sent_at > repeatCutoff) continue

      // Resolve email via auth admin.
      const { data: userRes } = await sb.auth.admin.getUserById(p.user_id)
      const email = userRes?.user?.email
      if (!email) continue

      const attemptNo = attemptCount + 1
      const idempotencyKey = `onboarding-reminder-${p.user_id}-${step.key}-${attemptNo}`

      const totalSteps = ctx.isBusiness ? 5 : 4
      const doneSteps = [
        ctx.hasProfileBasics && ctx.hasMarket && ctx.hasBusinessType,
        ctx.hasBoutique,
        ctx.hasProduct,
        ctx.isBusiness ? ctx.isVerified : null,
        ctx.hasPublishedBoutique,
      ].filter((v) => v === true).length

      const { error: sendErr } = await sb.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'onboarding-stuck-reminder',
          recipientEmail: email,
          idempotencyKey,
          templateData: {
            name: p.full_name || undefined,
            stepLabel: step.label,
            stepDescription: step.description,
            stepUrl: step.href,
            attemptNo,
            totalSteps,
            doneSteps,
          },
        },
      })
      if (sendErr) {
        console.warn('send failed', p.user_id, sendErr.message)
        continue
      }

      await sb.from('onboarding_reminders_log').insert({
        user_id: p.user_id,
        step_key: step.key,
        attempt_no: attemptNo,
      })
      sent++
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