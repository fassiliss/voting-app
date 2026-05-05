# iVoteForIt

A Next.js voting app with QR-code access, Supabase-backed candidates and votes, public results, and protected admin management.

## Setup

Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=use-a-long-unique-password
ADMIN_SESSION_SECRET=use-a-long-random-secret
ADMIN_RECOVERY_CODE=use-a-long-private-recovery-code
ADMIN_EMAILS=admin@example.com
```

`SUPABASE_SERVICE_ROLE_KEY` is recommended for protected admin routes. Keep it server-only and never prefix it with `NEXT_PUBLIC_`.

If you forget the admin password, open `/admin/forgot-password` and use `ADMIN_RECOVERY_CODE` to create a new one. Reset passwords are stored as a local server-side hash in `.data/admin-password.json`, which is ignored by git.

Google admin login requires Supabase Auth with the Google provider enabled. Add the admin Google account email address to `ADMIN_EMAILS`; separate multiple emails with commas.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production Notes

Enable Supabase Row Level Security before going live. Public users should only be able to read candidates/results and submit their own vote through your intended policies. Admin-only table changes should stay behind the protected server routes in this app.
