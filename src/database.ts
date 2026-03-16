import knex from 'knex'

import type { Knex } from 'knex'
import { env } from './env/index.js'

if (!process.env.DATABASE_URL) {
  throw new Error('Banco de dados não encontrado no .env')
}

export const config: Knex.Config = {
  client: 'sqlite',
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}

export const db = knex(config)
