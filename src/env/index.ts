import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'hom', 'prod']).default('dev'),
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error(
    'variaveis de ambientes configuradas erradas: ',
    _env.error.format(),
  )

  throw new Error('variaveis de ambiente invalidas')
}

export const env = _env.data
