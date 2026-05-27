import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function generateAccessToken(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  let body: { email?: string; portal?: 'suppliers' | 'ops'; code?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const email = (body.email ?? '').trim().toLowerCase()
  const portal = body.portal
  const code = (body.code ?? '').trim()
  if (!email || (portal !== 'suppliers' && portal !== 'ops') || !/^\d{6}$/.test(code)) {
    return json({ error: 'invalid_payload' }, 400)
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })
  const code_hash = await sha256Hex(`${email}:${portal}:${code}`)

  // Find most recent unconsumed OTP for this email/portal
  const { data: otp } = await supabase
    .from('partner_email_otps')
    .select('id, code_hash, expires_at, attempts, consumed_at')
    .eq('email', email)
    .eq('portal', portal)
    .is('consumed_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!otp) return json({ error: 'no_pending_code' }, 400)
  if (new Date(otp.expires_at).getTime() < Date.now()) return json({ error: 'expired' }, 400)
  if (otp.attempts >= 5) return json({ error: 'too_many_attempts' }, 429)

  if (otp.code_hash !== code_hash) {
    await supabase
      .from('partner_email_otps')
      .update({ attempts: otp.attempts + 1 })
      .eq('id', otp.id)
    return json({ error: 'invalid_code', attempts_remaining: 4 - otp.attempts }, 400)
  }

  // Mark consumed
  await supabase.from('partner_email_otps').update({ consumed_at: new Date().toISOString() }).eq('id', otp.id)

  // Find or create a submission for this email+portal
  const { data: existing } = await supabase
    .from('partner_onboarding_submissions')
    .select('id, access_token, status, payload, kyc_attachments, support_ticket_id')
    .eq('contact_email', email)
    .eq('portal', portal)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing) {
    const newToken = existing.access_token || generateAccessToken()
    await supabase
      .from('partner_onboarding_submissions')
      .update({
        email_verified_at: new Date().toISOString(),
        access_token: newToken,
        status: existing.status === 'draft' ? 'email_verified' : existing.status,
      })
      .eq('id', existing.id)
    return json({
      ok: true,
      access_token: newToken,
      submission_id: existing.id,
      status: existing.status,
      payload: existing.payload,
      kyc_attachments: existing.kyc_attachments,
      resumed: true,
    }, 200)
  }

  const access_token = generateAccessToken()
  const { data: created, error } = await supabase
    .from('partner_onboarding_submissions')
    .insert({
      portal,
      contact_email: email,
      access_token,
      email_verified_at: new Date().toISOString(),
      status: 'email_verified',
    })
    .select('id')
    .single()
  if (error || !created) {
    console.error('submission create failed', error)
    return json({ error: 'persist_failed' }, 500)
  }

  return json({ ok: true, access_token, submission_id: created.id, status: 'email_verified', resumed: false }, 200)

  function json(payload: unknown, status: number) {
    return new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})