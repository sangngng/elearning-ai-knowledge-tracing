import { createApp } from './app'
import { env } from './config/env'
import { closeExpiredAttendance } from './routes/academic'

const app = createApp()

const attendanceExpirySweep = setInterval(() => {
  closeExpiredAttendance().catch((error) => console.error('Attendance expiry sweep failed', error))
}, 15_000)
attendanceExpirySweep.unref()

app.listen(env.port, () => {
  console.log(`Backend listening on http://localhost:${env.port}`)
})
