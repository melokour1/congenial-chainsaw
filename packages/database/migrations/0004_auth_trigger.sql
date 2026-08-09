-- Auto-provisions a `profiles` row whenever someone signs up via Supabase Auth.
-- Without this, auth.users gets a row but public.profiles never does, and
-- every role-gated page (getCurrentProfile()) breaks for that account forever.
-- Role/fullName/phone come from the signUp() call's `options.data` metadata
-- (see apps/web/src/components/site/inline-auth-gate.tsx and
-- apps/mobile/src/lib/AuthProvider.tsx), defaulting to CUSTOMER if absent.
--
-- NOTE: this was already applied directly to the live Supabase project in an
-- earlier session but never committed here — this migration documents what's
-- actually live rather than re-applying it. Verified via pg_trigger/pg_proc
-- before writing this file; do not re-run apply_migration for this one.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, "fullName", email, phone, "createdAt", "updatedAt")
  values (
    new.id::text,
    coalesce(new.raw_user_meta_data->>'role', 'CUSTOMER')::"UserRole",
    coalesce(new.raw_user_meta_data->>'fullName', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'phone',
    now(),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
