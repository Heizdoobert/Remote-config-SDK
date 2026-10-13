# remote_config

Flags and tunable values the owner changes in the Supabase dashboard, with no deploy. Required, unlike `sdk/tracking-analytics`: the app imports it directly and there is no no-op seam.

- Table: `remote_config(key, value jsonb)`. Schema in `supabase/migrations/remote-config.sql`, run by hand in the SQL Editor. Anyone can read, nobody can write with the public key. Never store a secret here.
- `getRemoteConfig()` returns every key in `keys.ts`, from the table when the value has the right type and from the default otherwise. Rows for unregistered keys are ignored. It throws `DbError` when the read fails.
- `GET /api/config` serves the result to web and mobile. A CDN keeps a good answer for 60 seconds, so an edit shows up within about a minute under steady traffic; after a quiet spell the first request can still get a value up to 6 minutes old (`stale-while-revalidate=300`), and the next request is fresh. The route filters by `KEYS`, but the table itself is readable by anyone holding the Supabase publishable key through PostgREST, so "never store a secret here" is the only real boundary.
- Only this folder and `lib/db` may import `@/lib/db/client`; `eslint.config.mjs` enforces it.

## Add a key

1. Add it to `KEYS` in `keys.ts` with a `default` and a `parse` that returns `undefined` for a wrong type.
2. Insert a row in the dashboard or in a new migration.
3. Mirror it in `mobile/lib/services/remote_config_service.dart`.
