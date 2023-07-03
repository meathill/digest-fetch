import crypto from 'crypto';
import FetchError from "./error";

export default async function digestFetch(url: string, data: Record<string, unknown> = {}) {
  let nonce = '';
  // first time, send request, get nonce from response
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new FetchError({
        statusCode: response.status,
        message: await response.json(),
      });
    }
  } catch (e) {
    if (e.status !== 401) {
      throw e;
    }

    const auth = e.response.headers.get('www-authenticate');
    nonce = auth.match(/nonce="([^"]+)"/)[1];
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: getDigest(url, nonce),
      'content-type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new FetchError({
      statusCode: response.status,
      message: await response.json(),
    });
  }
}

function makeNonce(cnonceSize = 32): string {
  const nonceRaw = 'abcdef0123456789';
  let uid = '';
  for (let i = 0; i < cnonceSize; ++i) {
    uid += nonceRaw[Math.floor(Math.random() * nonceRaw.length)];
  }
  return uid;
}

export function getDigest(url: string, nonce: string): string {
  const _url = new URL(url);
  const uri = _url.pathname;
  const method = 'POST';
  const realm = 'tidb.cloud';
  const username = process.env.TIDB_PUBLIC_KEY;
  const password = process.env.TIDB_PRIVATE_KEY;
  const nc = '00000001';
  const cnonce = makeNonce();

  const ha1 = crypto.createHash('md5').update(`${username}:${realm}:${password}`).digest('hex');
  const ha2 = crypto.createHash('md5').update(`${method}:${uri}`).digest('hex');
  const response = crypto.createHash('md5').update(`${ha1}:${nonce}:${nc}:${cnonce}:auth:${ha2}`).digest('hex');
  return `Digest username="${username}",realm="${realm}",nonce="${nonce}",uri="${uri}",qop=auth,algorithm=MD5,response="${response}",nc=${nc},cnonce="${cnonce}"`;
}
