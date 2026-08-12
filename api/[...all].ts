async function getServerEntry() {
  // Dynamically import the SSR server entry provided by TanStack React Start
  const mod = await import('@tanstack/react-start/server-entry');
  return (mod as any).default ?? (mod as any);
}

function normalizeNodeRequestToWebRequest(req: any): Request {
  const protocol = req.headers['x-forwarded-proto'] || (req.socket?.encrypted ? 'https' : 'http');
  const host = req.headers.host || req.headers['x-forwarded-host'] || 'localhost';
  const url = `${protocol}://${host}${req.url}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers || {})) {
    if (Array.isArray(value)) {
      for (const v of value) {
        if (v != null) headers.append(key, String(v));
      }
    } else if (value != null) {
      headers.set(key, String(value));
    }
  }

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = req;
  }

  return new Request(url, init);
}

export default async function handler(req: Request) {
  const webRequest = normalizeNodeRequestToWebRequest(req);
  const entry = await getServerEntry();
  if (!entry || typeof entry.fetch !== 'function') {
    return new Response('Server entry not available', { status: 500 });
  }

  try {
    // Call the server entry's fetch handler with the incoming Request.
    const res = await entry.fetch(webRequest, undefined, undefined);
    return res instanceof Response ? res : new Response(String(res));
  } catch (err) {
    // Log for debugging on Vercel
    try {
      // eslint-disable-next-line no-console
      console.error('SSR handler error', err);
    } catch {}
    return new Response('Internal Server Error', { status: 500 });
  }
}
