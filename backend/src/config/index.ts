export const config = {
  port: Number(process.env.PORT ?? 8080),
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:3000,http://localhost:5173')
    .split(',').map((origin) => origin.trim()).filter(Boolean),
}
