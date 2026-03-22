import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const WRONG_ANSWERS_FILE = path.resolve(__dirname, 'wrong-answers.json')

function wrongAnswersApiPlugin() {
  return {
    name: 'wrong-answers-api',
    configureServer(server: any) {
      server.middlewares.use('/api/wrong-answers', (req: any, res: any) => {
        res.setHeader('Content-Type', 'application/json')

        if (req.method === 'GET') {
          const data = fs.existsSync(WRONG_ANSWERS_FILE)
            ? fs.readFileSync(WRONG_ANSWERS_FILE, 'utf-8')
            : '[]'
          res.end(data)
        } else if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: any) => { body += chunk })
          req.on('end', () => {
            fs.writeFileSync(WRONG_ANSWERS_FILE, body)
            res.end('{"ok":true}')
          })
        } else {
          res.statusCode = 405
          res.end('{"error":"Method not allowed"}')
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), wrongAnswersApiPlugin()],
})
