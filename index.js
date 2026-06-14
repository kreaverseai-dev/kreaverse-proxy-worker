export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const targetUrl = url.searchParams.get('targetUrl')
    const filename = url.searchParams.get('filename')

    if (!targetUrl) {
      return new Response('Missing targetUrl parameter', { status: 400 })
    }

    // Menangani CORS Preflight (OPTIONS request)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400',
        }
      })
    }

    try {
      const reqHeaders = new Headers({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      const clientRange = request.headers.get('range');
      if (clientRange) reqHeaders.set('range', clientRange);

      const response = await fetch(targetUrl, { headers: reqHeaders });

      const newHeaders = new Headers({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Accept-Ranges': 'bytes'
      });

      const essentialHeaders = ['content-type', 'content-length', 'accept-ranges', 'content-range'];
      for (const h of essentialHeaders) {
        const val = response.headers.get(h);
        if (val) newHeaders.set(h, val);
      }

      // Injeksi nama file kustom "Kreaverse AI - Judul Asli" dengan standar RFC 5987 agar aman dari crash browser Chrome HP
      if (filename) {
        const cleanFilename = filename.replace(/[\r\n]+/g, ' ')
        const safeAsciiFilename = cleanFilename.replace(/[^a-zA-Z0-9_\-\.]/g, '_')
        newHeaders.set('Content-Disposition', `attachment; filename="${safeAsciiFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`)
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      })
    } catch (e) {
      return new Response('Proxy Error: ' + e.message, { status: 500 })
    }
  }
}
