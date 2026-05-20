UPDATE public.profiles
SET plan_tier = 'pro'::plan_tier,
    updated_at = now()
WHERE user_id = (SELECT id FROM auth.users WHERE lower(email) = 'gliyetat@gmail.com' LIMIT 1);