import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface KycAttachment {
  slotId?: string
  fileName: string
  path: string
  size?: number
  mimeType?: string
}

interface SubmitBody {
  access_token?: string
  payload?: Record<string, unknown>
  kyc_attachments?: KycAttachment[]
  contact_name?: string
  company?: string
  summary_lines?: string[]
  is_resubmission?: boolean
  change_summary?: string
  diff?: Record<string, unknown>
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  let body: SubmitBody
  try { body = await req.json() } catch { return json({ error: 'invalid_json' }, 400) }

  const access_token = (body.access_token ?? '').trim()
  if (!access_token || access_token.length < 16) return json({ error: 'invalid_token' }, 400)

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

  const { data: sub } = await supabase
    .from('partner_onboarding_submissions')
    .select('id, portal, contact_email, contact_name, company, status, support_ticket_id, payload, kyc_attachments')
    .eq('access_token', access_token)
    .not('email_verified_at', 'is', null)
    .maybeSingle()

  if (!sub) return json({ error: 'not_found_or_unverified' }, 404)
  if (sub.status === 'approved') return json({ error: 'already_approved' }, 409)

  const portalLabel = sub.portal === 'suppliers' ? 'Fournisseur' : 'Logistique'
  const company = (body.company ?? sub.company ?? '').trim() || sub.contact_email
  const contact_name = (body.contact_name ?? sub.contact_name ?? '').trim() || null
  const payload = body.payload ?? sub.payload ?? {}
  const kyc = Array.isArray(body.kyc_attachments) ? body.kyc_attachments : (Array.isArray(sub.kyc_attachments) ? sub.kyc_attachments as KycAttachment[] : [])

  const isResubmission = !!body.is_resubmission && !!sub.support_ticket_id

  const messageLines = [
    `Portail : ${portalLabel}`,
    `Société : ${company}`,
    `Email : ${sub.contact_email}`,
    contact_name ? `Contact : ${contact_name}` : null,
    '',
    ...(body.summary_lines ?? []),
    '',
    '— Documents KYC —',
    ...(kyc.length ? kyc.map((k) => `• ${k.fileName} (${k.path})`) : ['Aucun document']),
  ].filter((l): l is string => l !== null).join('\n')

  let ticketId = sub.support_ticket_id as string | null

  if (!ticketId) {
    const subject = `[Onboarding ${portalLabel}] ${company}`
    const { data: t, error } = await supabase
      .from('support_tickets')
      .insert({
        source: 'partner_inquiry',
        contact_email: sub.contact_email,
        contact_name,
        subject,
        message: messageLines,
        boutique_id: null,
      })
      .select('id')
      .single()
    if (error || !t) {
      console.error('ticket create failed', error)
      return json({ error: 'ticket_failed' }, 500)
    }
    ticketId = t.id
  } else if (isResubmission) {
    // Resubmissions are recorded in partner_onboarding_history (below) and
    // surfaced to the team via the admin panel — we don't post into
    // support_ticket_responses (the table expects a real authenticated author).
  }

  // Attach KYC files to the support ticket (avoids manual Ops step)
  if (ticketId && kyc.length) {
    const rows = kyc.map((k) => ({
      ticket_id: ticketId!,
      storage_path: k.path,
      file_name: k.fileName,
      byte_size: k.size ?? null,
      mime_type: k.mimeType ?? null,
      uploaded_by: null,
    }))
    const { error: attErr } = await supabase.from('support_ticket_attachments').insert(rows)
    if (attErr) console.error('attachment link failed', attErr)
  }

  const submitted_at = new Date().toISOString()
  await supabase
    .from('partner_onboarding_submissions')
    .update({
      status: 'submitted',
      company,
      contact_name,
      payload,
      kyc_attachments: kyc,
      support_ticket_id: ticketId,
      submitted_at,
    })
    .eq('id', sub.id)

  // History entry
  await supabase.from('partner_onboarding_history').insert({
    submission_id: sub.id,
    change_summary: isResubmission
      ? (body.change_summary ?? 'Mise à jour du dossier')
      : 'Soumission initiale',
    diff: body.diff ?? {},
    actor_email: sub.contact_email,
  })

  // Confirmation email to the partner
  const origin = req.headers.get('origin') ?? 'https://brand-in-a-box.space'
  const portalUrl = `${origin}/${sub.portal}/portal/${access_token}`
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/send-transactional-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
      },
      body: JSON.stringify({
        templateName: 'partner-onboarding-submitted',
        recipientEmail: sub.contact_email,
        templateData: {
          company,
          portal: sub.portal === 'suppliers' ? 'fournisseur' : 'logistique',
          portalUrl,
          ticketNumber: ticketId?.slice(0, 8),
        },
      }),
    })
  } catch (e) {
    console.error('confirmation email failed', e)
  }

  return json({ ok: true, submission_id: sub.id, support_ticket_id: ticketId, portal_url: portalUrl }, 200)

  function json(payload: unknown, status: number) {
    return new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
