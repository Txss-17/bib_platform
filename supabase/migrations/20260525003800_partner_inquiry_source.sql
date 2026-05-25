-- Extend support ticket source enum with partner inquiries (suppliers / ops portals)
ALTER TYPE public.support_ticket_source ADD VALUE IF NOT EXISTS 'partner_inquiry';
