import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Body {
  access_token?: string
  action?:
    | 'create_event'        // catalog_draft, moq_request, issue_report, delivery_update, packaging_alert, return_logged
    | 'update_event_status' // mark resolved/in_progress
    | 'add_document'        // ad-hoc doc upload (already in storage)
  // create_event
  kind?: string
  title?: string
  payload?: Record<string, unknown>
  // update_event_status
  event_id?: string
  status?: 'in_progress' | 'resolved' | 'rejected'
  // add_document
  category?: string
  file_name?: string
  storage_path?: string
  mime_type?: string
  byte_size?: number
}

const ALLOWED_KINDS = new Set([
  'catalog_draft','moq_request','issue_report',
  'delivery_update','packaging_alert','return_logged',
])

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  let body: Body
  try { body = await req.json() } catch { return json({ error: 'invalid_json' }, 400) }

  const token = (body.access_token ?? '').trim()
  if (!token || token.length < 16) return json({ error: 'invalid_token' }, 400)

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

  const { data: sub, error: subErr } = await supabase
    .from('partner_onboarding_submissions')
    .select('id, portal, status')
    .eq('access_token', token)
    .maybeSingle()

  if (subErr || !sub) return json({ error: 'not_found' }, 404)
  if (sub.status !== 'approved') return json({ error: 'not_approved' }, 403)

  try {
    if (body.action === 'create_event') {
      if (!body.kind || !ALLOWED_KINDS.has(body.kind)) return json({ error: 'invalid_kind' }, 400)
      if (!body.title || body.title.length < 2 || body.title.length > 200) return json({ error: 'invalid_title' }, 400)
      const { data, error } = await supabase
        .from('partner_portal_events')
        .insert({
          submission_id: sub.id,
          portal: sub.portal,
          kind: body.kind,
          title: body.title.trim(),
          payload: body.payload ?? {},
        })
        .select('id')
        .single()
      if (error) return json({ error: error.message }, 500)
      return json({ ok: true, id: data.id })
    }

    if (body.action === 'update_event_status') {
      if (!body.event_id) return json({ error: 'missing_event_id' }, 400)
      if (!body.status || !['in_progress','resolved','rejected'].includes(body.status))
        return json({ error: 'invalid_status' }, 400)
      const { error } = await supabase
        .from('partner_portal_events')
        .update({ status: body.status })
        .eq('id', body.event_id)
        .eq('submission_id', sub.id)
      if (error) return json({ error: error.message }, 500)
      return json({ ok: true })
    }

    if (body.action === 'add_document') {
      if (!body.category || !body.file_name || !body.storage_path) return json({ error: 'missing_fields' }, 400)
      const { data, error } = await supabase
        .from('partner_portal_documents')
        .insert({
          submission_id: sub.id,
          category: body.category,
          file_name: body.file_name,
          storage_path: body.storage_path,
          mime_type: body.mime_type ?? null,
          byte_size: body.byte_size ?? null,
        })
        .select('id')
        .single()
      if (error) return json({ error: error.message }, 500)
      return json({ ok: true, id: data.id })
    }

    return json({ error: 'unknown_action' }, 400)
  } catch (e) {
    return json({ error: (e as Error).message }, 500)
  }
})

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
