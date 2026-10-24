import dotenv from 'dotenv'
import { createApp } from './app'
import { env } from './config/env'

dotenv.config()

const app = createApp()

app.listen(env.port, () => {
  console.log(`Backend listening on http://localhost:${env.port}`)
})
