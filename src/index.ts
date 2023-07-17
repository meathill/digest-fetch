import * as crypto from 'crypto';
import FetchError from "./error";

type FetchOptions = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  realm: string;
  username: string;
  password: string;
}

export default async function digestFetch(
  url: string,
  data: Record<string, unknown> | null,
  options: FetchOptions
): Promise<Response> {
  let nonce = '';
  options.method ??= 'POST';
  if (!options.realm) {
    throw new Error('`options.realm` is required');
  }
  if (!options.username) {
    throw new Error('`options.username` is required');
  }
  if (!options.password) {
    throw new Error('`options.password` is required');
  }

  const { method } = options;
  // first time, send request, get nonce from response
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'content-type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new FetchError({
        statusCode: response.status,
        message: await response.text(),
        response,
      });
    }
  } catch (e) {
    if (e.status !== 401) {
      throw e;
    }

    const auth = e.response.headers.get('www-authenticate');
    nonce = auth.match(/nonce="([^"]+)"/)[1];
  }

  const init: RequestInit = {
    method,
    headers: {
      Authorization: getDigest(url, nonce, options),
      'content-type': 'application/json',
    },
  };
  if (data && method !== 'GET') {
    init.body = JSON.stringify(data);
  }
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new FetchError({
      statusCode: response.status,
      message: await response.text(),
      response,
    });
  }

  return response;
}

function makeNonce(cnonceSize = 32): string {
  const nonceRaw = 'abcdef0123456789';
  let uid = '';
  for (let i = 0; i < cnonceSize; ++i) {
    uid += nonceRaw[Math.floor(Math.random() * nonceRaw.length)];
  }
  return uid;
}

function getDigest(url: string, nonce: string, options: FetchOptions): string {
  const _url = new URL(url);
  const uri = _url.pathname + _url.search;
  const { method, realm, username, password } = options;
  const nc = '00000001';
  const cnonce = makeNonce();

  const ha1 = crypto.createHash('md5').update(`${username}:${realm}:${password}`).digest('hex');
  const ha2 = crypto.createHash('md5').update(`${method}:${uri}`).digest('hex');
  const response = crypto.createHash('md5').update(`${ha1}:${nonce}:${nc}:${cnonce}:auth:${ha2}`).digest('hex');
  return `Digest username="${username}",realm="${realm}",nonce="${nonce}",uri="${uri}",qop=auth,algorithm=MD5,response="${response}",nc=${nc},cnonce="${cnonce}"`;
}

export { FetchError };
