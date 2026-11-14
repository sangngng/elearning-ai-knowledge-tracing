import { Pool } from 'pg'
import { env } from './env'

export const pool = new Pool({
  connectionString: env.databaseUrl,
  // Fail fast instead of hanging when the database is down; requests then return HTTP 500.
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 30_000,
})

// An idle client loses its connection when PostgreSQL restarts. Without this listener the
// 'error' event is unhandled and the whole Node process exits. The pool discards the broken
// client and opens a new connection on the next query.
pool.on('error', (error) => {
  console.error('PostgreSQL idle client error; the connection will be replaced', error.message)
})

// A client checked out for a transaction (pool.connect) is not covered by the pool listener.
// Give every new client its own listener so a dropped connection fails the request, not the process.
pool.on('connect', (client) => {
  client.on('error', (error) => {
    console.error('PostgreSQL client error during a request', error.message)
  })
})
