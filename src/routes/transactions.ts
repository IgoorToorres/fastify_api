import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { db } from '../database.js'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const transactions = await db('transactions').select()

    return { transactions }
  })

  app.get('/:id', async (request) => {
    const getParamsRequestSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getParamsRequestSchema.parse(request.params)

    const transaction = await db('transactions').where('id', id).first()

    return { transaction }
  })

  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    await db('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
    })

    return reply.status(201).send('Transação cadastrada com sucesso')
  })
}
