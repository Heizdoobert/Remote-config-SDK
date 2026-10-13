# Remote Config SDK (@quiz/remote-config)

Flags and tunable values changed in the database/dashboard without redeployment.

- `src/index.ts`: `getRemoteConfig()` implementation querying `remote_config` table.
- `src/keys.ts`: Config keys registry, parsing, and type definitions.
- Table: `remote_config(key, value jsonb)`. Schema in Supabase migrations.
- `GET /api/config` serves the result to web and mobile.

## Add a key

1. Add it to `KEYS` in `src/keys.ts` with a `default` and a `parse` that returns `undefined` for a wrong type.
2. Insert a row in the dashboard or in a new migration.
3. Mirror it in client apps where applicable.
