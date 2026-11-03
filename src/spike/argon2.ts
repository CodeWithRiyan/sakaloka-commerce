import { hash, verify } from '@node-rs/argon2';
import { timed, type SpikeResult } from './types';

/** Argon2id with the library defaults (19 MiB memory, 2 passes), as R4 will use. */
export async function spikeArgon2(): Promise<SpikeResult[]> {
  const hashed = await timed(() => hash('correct horse battery staple'));
  const good = await timed(() => verify(hashed.value, 'correct horse battery staple'));
  const bad = await verify(hashed.value, 'wrong password');
  return [
    {
      name: 'Argon2id hash and verify',
      pass: hashed.value.startsWith('$argon2id$') && good.value && !bad,
      detail: `hash ${hashed.ms} ms, verify ${good.ms} ms, prefix ${hashed.value.slice(0, 31)}`,
    },
  ];
}
