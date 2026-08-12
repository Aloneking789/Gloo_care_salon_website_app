import type { IncomingMessage, ServerResponse } from 'http';

async function getServerEntry() {
  // Dynamically import the compiled SSR server entry
  // @ts-ignore
  const mod = await import('../dist/server/index.js');
  return (mod as any).default ?? (mod as any);
}

function normalizeNodeRequestToWebRequest(req: IncomingMessage): Request {
  const protocol = req.headers['x-forwarded-proto'] || ((req.socket as any)?.encrypted ? 'https' : 'http');
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
    init.body = req as any;
  }

  return new Request(url, init);
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const webRequest = normalizeNodeRequestToWebRequest(req);
    const entry = await getServerEntry();
    
    if (!entry || typeof entry.fetch !== 'function') {
      res.statusCode = 500;
      res.end('Server entry not available');
      return;
    }

    // Call the server entry's fetch handler with the incoming Request.
    const webResponse = await entry.fetch(webRequest, undefined, undefined);
    
    // Normalize response if it's not a standard Response object
    const actualResponse = webResponse instanceof Response ? webResponse : new Response(String(webResponse));

    // Copy status and headers to Node's ServerResponse
    res.statusCode = actualResponse.status;
    if (actualResponse.statusText) {
      res.statusMessage = actualResponse.statusText;
    }
    
    actualResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Write body to Node's ServerResponse
    const body = await actualResponse.arrayBuffer();
    res.end(Buffer.from(body));
  } catch (err) {
    try {
      console.error('SSR handler error', err);
    } catch {}
    if (!res.writableEnded) {
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }
}

