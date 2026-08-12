async function getServerEntry() {
  // Dynamically import the SSR server entry provided by TanStack React Start
  const mod = await import('@tanstack/react-start/server-entry');
  return (mod as any).default ?? (mod as any);
}

export default async function handler(req: Request) {
  const entry = await getServerEntry();
  if (!entry || typeof entry.fetch !== 'function') {
    return new Response('Server entry not available', { status: 500 });
  }

  try {
    // Call the server entry's fetch handler with the incoming Request.
    // The second and third args (env, ctx) are not used on Vercel edge runtime.
    const res = await entry.fetch(req as unknown as Request, undefined, undefined);
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
