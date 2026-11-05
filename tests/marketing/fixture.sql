CREATE TABLE public.boutique_customers(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),boutique_id uuid,email text,full_name text,marketing_opt_in boolean DEFAULT false,total_spent_cents bigint DEFAULT 0);
CREATE TABLE public.suppressed_emails(email text PRIMARY KEY);
CREATE TABLE public.test_mail_queue(id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,payload jsonb);
CREATE FUNCTION public.enqueue_email(queue_name text,payload jsonb) RETURNS bigint LANGUAGE plpgsql AS $$
DECLARE result bigint; BEGIN
 IF queue_name<>'transactional_emails' THEN RAISE EXCEPTION 'wrong_queue'; END IF;
 INSERT INTO test_mail_queue(payload) VALUES(payload) RETURNING id INTO result; RETURN result;
END; $$;
