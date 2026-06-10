export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const targetUrl = url.searchParams.get('targetUrl')

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
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })

      const newHeaders = new Headers(response.headers)
      newHeaders.set('Access-Control-Allow-Origin', '*')
      newHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS')
      newHeaders.set('Access-Control-Allow-Headers', '*')

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
