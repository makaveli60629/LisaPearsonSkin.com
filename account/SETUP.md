# Member access activation

The login, registration, email-confirmation callback and password recovery interface is implemented. It is deliberately disabled until a real Supabase Auth project is connected. No accounts are created by the preview, and browser lead storage is not an authenticated database.

1. Create or connect the owner's Supabase project. Enable email/password authentication and email confirmation; set a minimum 12-character password policy and production email delivery.
2. Set the Site URL to `https://lisapearsonskin.com/account/`. Allow this exact callback and `https://lisapearsonskin.com/account/?mode=reset`.
3. Put only the project URL and **sb_publishable_** key in `account/config.js`. Never commit service-role, secret, SMTP or database credentials.
4. Test real signup, confirmation, login, token expiry/refresh, recovery, logout, incorrect password and expired links before announcing registration is open.
5. Shared property storage remains a separate integration. Add owner-scoped database tables and row-level access controls; verify two-user isolation before moving any browser records online. This implementation makes no claim that local leads are private cloud records.

API references: https://supabase.com/docs/guides/auth and https://github.com/supabase/auth . Tokens are kept in sessionStorage for the current tab session; passwords are never persisted. No service or paid plan has been provisioned by this change.
