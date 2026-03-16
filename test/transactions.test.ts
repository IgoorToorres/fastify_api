import { afterAll, beforeAll, it, describe, expect, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import { app } from '../src/app'
import request from 'supertest'

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'new transaction',
        amount: 2000,
        type: 'credit',
      })
      .expect(201)
  })

  it('should be able to list all the transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new transaction',
        amount: 2000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    if (!cookies) {
      throw new Error('Expected Set-Cookie to be present')
    }

    const listTransactionsRespons = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(listTransactionsRespons.body.transactions).toEqual([
      expect.objectContaining({
        title: 'new transaction',
        amount: 2000,
      }),
    ])
  })

  it('should be able to get a specific transaction by parameters', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new transaction',
        amount: 2000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    if (!cookies) {
      throw new Error('Expected Set-Cookie to be present')
    }

    const listTransactionsRespons = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    const id = listTransactionsRespons.body.transactions[0].id

    if (!id) {
      throw new Error('Expected id in body')
    }

    const transaction = await request(app.server)
      .get(`/transactions/${id}`)
      .set('Cookie', cookies)

    expect(transaction.statusCode).toBe(200)
    expect(transaction.body).toEqual({
      transaction: expect.objectContaining({
        id,
        title: 'new transaction',
        amount: 2000,
      }),
    })
  })

  it('should be able to get the summary of transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'credit transaction',
        amount: 2000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    if (!cookies) {
      throw new Error('Expected Set-Cookie to be present')
    }

    await request(app.server)
      .post('/transactions')
      .send({
        title: 'debit transaction',
        amount: 1000,
        type: 'debit',
      })
      .set('Cookie', cookies)

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)

    expect(summaryResponse.statusCode).toBe(200)
    expect(summaryResponse.body).toEqual({
      summary: expect.objectContaining({
        amount: 1000,
      }),
    })
  })
})
