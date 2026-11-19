import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
const read=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');
const a='10000000-0000-4000-8000-000000000001';
const b='10000000-0000-4000-8000-000000000002';
let db;
before(async()=>{
 db=new PGlite();
 await db.exec(`CREATE ROLE authenticated; CREATE ROLE anon; CREATE ROLE service_role;
 CREATE SCHEMA auth; GRANT USAGE ON SCHEMA auth TO authenticated,anon;
 CREATE TABLE auth.users(id uuid PRIMARY KEY,email text);
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
 SELECT (coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb->>'sub')::uuid; $$;
 CREATE TABLE public.support_tickets(id uuid PRIMARY KEY);
 CREATE FUNCTION public.update_updated_at_column() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at=now();RETURN NEW;END;$$;
 INSERT INTO auth.users VALUES('${a}','a@example.invalid'),('${b}','b@example.invalid');`);
 await db.exec(read('drizzle/migrations/0005_create_partner_onboarding_submissions.sql'));
 await db.exec(read('drizzle/migrations/0030_current_auth_email_policy.sql'));
 await db.exec(`INSERT INTO public.partner_onboarding_submissions(id,portal,contact_email,company,approved_at) VALUES
 ('20000000-0000-4000-8000-000000000001','supplier','a@example.invalid','A pending',NULL),
 ('20000000-0000-4000-8000-000000000002','supplier','b@example.invalid','B pending',NULL),
 ('20000000-0000-4000-8000-000000000003','supplier','a@example.invalid','A approved',now());`);
});
after(async()=>{await db?.close();});
async function actor(id,role='authenticated'){
 await db.exec('RESET ROLE');
 await db.query("SELECT set_config('request.jwt.claims',$1,false)",[
  JSON.stringify({sub:id,role,email:'b@example.invalid',user_metadata:{email:'b@example.invalid',role:'admin'}}),
 ]);
 await db.exec(`SET ROLE ${role}`);
}
test('current Auth email controls ownership even when JWT email metadata is forged',async()=>{
 await actor(a);
 assert.equal((await db.query('SELECT public.bib_current_auth_email() email')).rows[0].email,'a@example.invalid');
 assert.deepEqual((await db.query('SELECT company FROM public.partner_onboarding_submissions ORDER BY company')).rows.map(x=>x.company),['A approved','A pending']);
 await assert.rejects(db.query('SELECT email FROM auth.users'),e=>e.code==='42501');
});
test('pending owner updates stay scoped and cannot transfer the dossier to another email',async()=>{
 await actor(a);
 assert.equal((await db.query("UPDATE public.partner_onboarding_submissions SET status='review' WHERE company='A pending' RETURNING id")).rows.length,1);
 assert.equal((await db.query("UPDATE public.partner_onboarding_submissions SET status='review' WHERE company='B pending' RETURNING id")).rows.length,0);
 assert.equal((await db.query("UPDATE public.partner_onboarding_submissions SET status='review' WHERE company='A approved' RETURNING id")).rows.length,0);
 await assert.rejects(db.query("UPDATE public.partner_onboarding_submissions SET contact_email='b@example.invalid' WHERE company='A pending'"),e=>e.code==='42501');
});
test('unregistered identities cannot read dossiers through matching email claims',async()=>{
 await actor('10000000-0000-4000-8000-000000000099');
 assert.equal((await db.query('SELECT public.bib_current_auth_email() email')).rows[0].email,null);
 assert.equal((await db.query('SELECT id FROM public.partner_onboarding_submissions')).rows.length,0);
});
test('anonymous callers cannot execute the Auth lookup or read dossiers',async()=>{
 await actor(null,'anon');
 await assert.rejects(db.query('SELECT public.bib_current_auth_email()'),e=>e.code==='42501');
 assert.equal((await db.query('SELECT id FROM public.partner_onboarding_submissions')).rows.length,0);
});
