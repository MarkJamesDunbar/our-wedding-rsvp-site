import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiProxyTarget =
  process.env.VITE_API_PROXY_TARGET || 'https://our-wedding-rsvp-site-production.up.railway.app'

// Dev-only endpoint. A phone can POST its live viewport metrics here and they are
// printed in the terminal running Vite, so real on-device numbers land somewhere
// readable without transcribing them by hand. Only active during `vite` (serve).
function viewportLogger() {
  return {
    name: 'viewport-logger',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'POST' || !req.url || !req.url.startsWith('/__viewport-log')) {
          return next()
        }

        let body = ''
        req.on('data', (chunk) => {
          body += chunk
          if (body.length > 1e6) req.destroy()
        })
        req.on('end', () => {
          try {
            const d = JSON.parse(body || '{}')
            const time = new Date().toLocaleTimeString()
            server.config.logger.info(
              `\n\u001b[35m[viewport ${time}]\u001b[0m ${d.label || ''}` +
                `\n  host=${d.host}  href=${d.href}` +
                `\n  lvh=${d.lvh}  svh=${d.svh}  dvh=${d.dvh}  innerH=${d.innerHeight}  visualH=${d.visualHeight}` +
                `\n  screen=${d.screenWidth}x${d.screenHeight}  dpr=${d.dpr}  safe(t/r/b/l)=${d.safeTop}/${d.safeRight}/${d.safeBottom}/${d.safeLeft}` +
                `\n  ua=${d.ua || ''}`
            )
          } catch (err) {
            server.config.logger.warn(`[viewport] bad payload: ${err}`)
          }
          res.statusCode = 204
          res.end()
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viewportLogger()],
  server: {
    host: true,
    // Allow access through tunnels (e.g. *.trycloudflare.com) and the LAN IP.
    allowedHosts: true,
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
})
