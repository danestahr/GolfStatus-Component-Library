import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const TUNING_FILE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src/styles/component-tuning.json')

// Dev-only endpoint behind the Component Tuner (src/dev/ComponentTuner.jsx):
// it POSTs the whole tuning map here and we write it to
// src/styles/component-tuning.json, which main.jsx turns into a stylesheet —
// so tweaks are saved in the repo and apply to every instance, everywhere.
function componentTuningSave() {
  return {
    name: 'component-tuning-save',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__tuning/save', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end()
        }
        let body = ''
        req.on('data', chunk => (body += chunk))
        req.on('end', () => {
          try {
            const data = JSON.parse(body)
            fs.writeFileSync(TUNING_FILE, JSON.stringify(data, null, 2) + '\n')
            res.statusCode = 200
            res.end('ok')
          } catch (err) {
            res.statusCode = 400
            res.end(String(err))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), componentTuningSave()],
})
