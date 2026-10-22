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
    | 'list_orders'         // ops: list paid orders awaiting logistics
    | 'get_order'           // ops: scan one paid order
    | 'get_shipping_labels' // ops: build labels from paid order addresses
    | 'list_shipments'      // ops: read shipment tracking rows
    | 'shipment_update'     // ops: driver/carton/label/status tracking
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
  order_ids?: string[]
}

const EVENT_KINDS_BY_PORTAL: Record<string, Set<string>> = {
  suppliers: new Set(['catalog_draft', 'moq_request', 'issue_report', 'delivery_update']),
  ops: new Set(['delivery_update', 'packaging_alert', 'return_logged']),
}

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
      if (!body.kind || !EVENT_KINDS_BY_PORTAL[sub.portal]?.has(body.kind)) return json({ error: 'invalid_kind' }, 400)
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

    if (sub.portal === 'ops' && body.action === 'list_orders') {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, amount, logistics_status, created_at')
        .eq('payment_status', 'paid')
        .in('logistics_status', ['pending','processing','shipped'])
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) return json({ error: error.message }, 500)
      return json({ ok: true, orders: data })
    }

    if (sub.portal === 'ops' && body.action === 'get_order') {
      const orderNumber = String(body.order_number ?? '').trim().toUpperCase()
      if (!/^[A-Z0-9-]{4,30}$/.test(orderNumber)) return json({ error: 'invalid_order_number' }, 400)
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, amount, logistics_status, created_at')
        .eq('order_number', orderNumber)
        .eq('payment_status', 'paid')
        .maybeSingle()
      if (error) return json({ error: error.message }, 500)
      if (!data) return json({ error: 'order_not_found' }, 404)
      return json({ ok: true, order: data })
    }
    if (sub.portal === 'ops' && body.action === 'get_shipping_labels') {
      const orderIds = body.order_ids
      if (!Array.isArray(orderIds) || orderIds.length < 1 || orderIds.length > 50 || orderIds.some((id) => !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))) {
        return json({ error: 'invalid_order_ids' }, 400)
      }

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, boutique_id, product_id, quantity, created_at')
        .eq('payment_status', 'paid')
        .in('id', orderIds)
      if (ordersError) return json({ error: ordersError.message }, 500)
      if (!orders || orders.length !== orderIds.length) return json({ error: 'paid_order_not_found' }, 404)

      const [{ data: addresses, error: addressError }, { data: boutiques, error: boutiqueError }, { data: products, error: productError }] = await Promise.all([
        supabase.from('order_shipping_addresses').select('order_id, recipient_name, recipient_phone, address_line, city, region, postal_code, country').in('order_id', orderIds),
        supabase.from('boutiques').select('id, name, legal_business_name, legal_address').in('id', [...new Set(orders.map((order) => order.boutique_id))]),
        supabase.from('products').select('id, supplier_product_id').in('id', [...new Set(orders.map((order) => order.product_id).filter(Boolean))]),
      ])
      if (addressError || boutiqueError || productError) return json({ error: 'label_data_unavailable' }, 500)
      if (!addresses || addresses.length !== orderIds.length) return json({ error: 'shipping_address_missing' }, 409)

      const supplierIds = [...new Set((products ?? []).map((product) => product.supplier_product_id).filter(Boolean))]
      const { data: suppliers, error: supplierError } = supplierIds.length
        ? await supabase.from('supplier_products').select('id, name').in('id', supplierIds)
        : { data: [], error: null }
      if (supplierError) return json({ error: 'label_data_unavailable' }, 500)

      const addressByOrder = new Map((addresses ?? []).map((address) => [address.order_id, address]))
      const boutiqueById = new Map((boutiques ?? []).map((boutique) => [boutique.id, boutique]))
      const supplierById = new Map((suppliers ?? []).map((supplier) => [supplier.id, supplier.name]))
      const supplierIdByProduct = new Map((products ?? []).map((product) => [product.id, product.supplier_product_id]))
      const labels = []

      for (const order of orders) {
        const address = addressByOrder.get(order.id)
        const boutique = boutiqueById.get(order.boutique_id)
        if (!address || !boutique) return json({ error: 'label_data_unavailable' }, 500)
        const senderAddressLines = String(boutique.legal_address ?? '').split(/\r?\n|,/).map((line) => line.trim()).filter(Boolean)
        if (!senderAddressLines.length) return json({ error: 'sender_address_missing' }, 409)
        const productSupplierId = supplierIdByProduct.get(order.product_id)
        const recipientAddressLines = [
          address.address_line,
          [address.postal_code, address.city].filter(Boolean).join(' '),
          address.region,
          address.recipient_phone ? `Tél. ${address.recipient_phone}` : null,
        ].filter(Boolean)
        labels.push({
          orderId: order.id,
          data: {
            orderNumber: order.order_number,
            sender: { name: boutique.legal_business_name ?? boutique.name ?? 'Boutique BIB', addressLines: senderAddressLines.slice(0, 4) },
            recipient: { name: address.recipient_name, addressLines: recipientAddressLines, country: address.country },
            product: { sku: String(order.product_id ?? '').slice(0, 8).toUpperCase() || '—', reference: supplierById.get(productSupplierId) ?? '—', quantity: order.quantity ?? 1 },
            shipDate: new Date().toLocaleDateString('fr-FR'),
            trackingUrl: `https://shop.brand-in-a-box.space/tracking?order=${encodeURIComponent(order.order_number)}`,
          },
        })
      }
      return json({ ok: true, labels })
    }
    if (sub.portal === 'ops' && body.action === 'list_shipments') {
      const { data, error } = await supabase
        .from('order_shipments')
        .select('order_id, driver_name, driver_phone, carrier, tracking_number, carton_size, received_at, carton_printed_at, label_printed_at, eta, last_location')
        .order('updated_at', { ascending: false })
        .limit(200)
      if (error) return json({ error: error.message }, 500)
      return json({ ok: true, shipments: data })
    }

    if (sub.portal === 'ops' && body.action === 'shipment_update') {
      const b = body as Record<string, unknown>
      const orderNumber = String(b.order_number ?? '').trim().toUpperCase()
      if (!/^[A-Z0-9-]{4,30}$/.test(orderNumber)) return json({ error: 'invalid_order_number' }, 400)
      const { data: order, error: orderError } = await supabase.from('orders').select('id').eq('order_number', orderNumber).eq('payment_status', 'paid').maybeSingle()
      if (orderError) return json({ error: 'order_lookup_failed' }, 500)
      if (!order) return json({ error: 'paid_order_not_found' }, 404)

      const str = (k: string, max = 120) => {
        const v = b[k]; if (v === undefined) return undefined
        const s = String(v ?? '').trim().slice(0, max); return s || null
      }
      const patch: Record<string, unknown> = { order_id: order.id, submission_id: sub.id }
      for (const k of ['driver_name','driver_phone','carrier','tracking_number','carton_size','last_location']) {
        const v = str(k); if (v !== undefined) patch[k] = v
      }
      const eta = str('eta', 10); if (eta !== undefined) patch.eta = eta
      const now = new Date().toISOString()
      if (b.mark === 'received') patch.received_at = now
      if (b.mark === 'carton_printed') patch.carton_printed_at = now
      if (b.mark === 'label_printed') patch.label_printed_at = now

      const { error: upErr } = await supabase.from('order_shipments').upsert(patch, { onConflict: 'order_id' })
      if (upErr) return json({ error: upErr.message }, 500)

      const status = str('status', 20)
      if (status && ['processing','shipped','delivered','returned'].includes(status)) {
        const { error: statusErr } = await supabase
          .from('orders')
          .update({ logistics_status: status })
          .eq('id', order.id)
        if (statusErr) return json({ error: statusErr.message }, 500)
      }
      const label = str('event_label', 200)
      if (label) {
        const { error: eventErr } = await supabase.from('shipment_events').insert({
          order_id: order.id, status: status ?? (b.mark as string) ?? 'update', label,
          location: (patch.last_location as string) ?? null, driver_name: (patch.driver_name as string) ?? null,
        })
        if (eventErr) return json({ error: eventErr.message }, 500)
      }
      return json({ ok: true })
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
