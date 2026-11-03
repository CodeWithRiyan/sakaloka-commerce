import { del, get, put } from '@vercel/blob';
import { timed, type SpikeResult } from './types';

/** Private upload, streamed download and delete, with the private store's token. */
export async function spikeBlob(token: string): Promise<SpikeResult[]> {
  const body = `spike ${new Date().toISOString()}`;
  const uploaded = await timed(() =>
    put(`designs/spike/${crypto.randomUUID()}.txt`, body, {
      access: 'private',
      contentType: 'text/plain',
      token,
    }),
  );
  const fetched = await timed(() => get(uploaded.value.pathname, { access: 'private', token }));
  const read =
    fetched.value && fetched.value.statusCode === 200
      ? await new Response(fetched.value.stream).text()
      : null;
  const anonymous = await fetch(uploaded.value.url).then((r) => r.status);
  await del(uploaded.value.url, { token });
  const afterDelete = await get(uploaded.value.pathname, { access: 'private', token });

  return [
    {
      name: 'Private Blob upload and download',
      pass: read === body,
      detail: `put ${uploaded.ms} ms, get ${fetched.ms} ms, content ${read === body ? 'matches' : 'differs'}`,
    },
    {
      name: 'Private Blob refuses a request without the token',
      pass: anonymous === 401 || anonymous === 403 || anonymous === 404,
      detail: `anonymous GET returned ${anonymous}`,
    },
    {
      name: 'Deleted blob is gone',
      pass: afterDelete === null,
      detail: afterDelete === null ? 'get returned null' : 'still readable',
    },
  ];
}
