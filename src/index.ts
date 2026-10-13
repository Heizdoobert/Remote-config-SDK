import 'server-only';
import { pub } from '@/lib/db/client';
import { unwrap } from '@/lib/db/errors';
import { KEYS } from './keys';

// A hung database must still let the route answer its quick 503.
const TIMEOUT_MS = 3000;

export type RemoteConfig = { [K in keyof typeof KEYS]: (typeof KEYS)[K]['default'] };

export const REMOTE_CONFIG_DEFAULTS = Object.fromEntries(
  Object.entries(KEYS).map(([key, spec]) => [key, spec.default]),
) as RemoteConfig;

// Every registered key, from the table when it holds a valid value and from its default
// otherwise. Throws DbError when the read fails; the caller decides what to answer.
export async function getRemoteConfig(): Promise<RemoteConfig> {
  const rows =
    unwrap<{ key: string; value: unknown }[]>(
      'remote_config.list',
      await pub.from('remote_config').select('key, value').abortSignal(AbortSignal.timeout(TIMEOUT_MS)),
    ) ?? [];
  const config: Record<string, unknown> = { ...REMOTE_CONFIG_DEFAULTS };
  for (const { key, value } of rows) {
    if (!Object.hasOwn(KEYS, key)) continue; // an unregistered row never leaves the server
    const parsed = KEYS[key as keyof typeof KEYS].parse(value);
    if (parsed !== undefined) config[key] = parsed;
  }
  return config as RemoteConfig;
}
