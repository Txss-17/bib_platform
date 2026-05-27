import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function generateOtp(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000
  return n.toString().padStart(6, '0')
}

function isValidEmail(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  let body: { email?: string; portal?: 'suppliers' | 'ops' }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const email = (body.email ?? '').trim().toLowerCase()
  const portal = body.portal
  if (!isValidEmail(email) || email.length > 255) return json({ error: 'invalid_email' }, 400)
  if (portal !== 'suppliers' && portal !== 'ops') return json({ error: 'invalid_portal' }, 400)

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

  // Rate limit : max 3 OTP requests per email/portal per 60s
  const { count } = await supabase
    .from('partner_email_otps')
    .select('id', { count: 'exact', head: true })
    .eq('email', email)
    .eq('portal', portal)
    .gte('created_at', new Date(Date.now() - 60_000).toISOString())
  if ((count ?? 0) >= 3) return json({ error: 'rate_limited', retry_after_seconds: 60 }, 429)

  const code = generateOtp()
  const code_hash = await sha256Hex(`${email}:${portal}:${code}`)
  const expires_at = new Date(Date.now() + 10 * 60_000).toISOString()

  const { error: insErr } = await supabase
    .from('partner_email_otps')
    .insert({ email, portal, code_hash, expires_at })
  if (insErr) {
    console.error('otp insert failed', insErr)
    return json({ error: 'persist_failed' }, 500)
  }

  // Fire the transactional email through the existing pipeline.
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/send-transactional-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
      },
      body: JSON.stringify({
        templateName: 'partner-otp',
        recipientEmail: email,
        templateData: { code, portal: portal === 'suppliers' ? 'fournisseur' : 'logistique', minutes: 10 },
      }),
    })
  } catch (e) {
    console.error('OTP email enqueue failed', e)
    // Don't leak failure to client — the row exists and we still want them to retry.
  }

  return json({ ok: true, expires_in_seconds: 600 }, 200)

  function json(payload: unknown, status: number) {
    return new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})