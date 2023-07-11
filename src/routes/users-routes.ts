import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { knex } from '../database'
import { checkSessionIdSession } from '../middlewares/check-session-id-exists'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (req: FastifyRequest, res: FastifyReply) => {
    const createUserBodySchema = z.object({
      firstName: z.string().nonempty('First name cannot be empty'),
      lastName: z.string().nonempty('Last name cannot be empty'),
      photoUrl: z.string().url().nonempty('Photo URL cannot be empty'),
    })

    const validationResult = createUserBodySchema.safeParse(req.body)

    if (!validationResult.success) {
      return res.status(400).send({
        message: validationResult.error.errors,
      })
    }

    const { firstName, lastName, photoUrl } = validationResult.data

    let sessionId = req.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()
      res.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    const user = await knex('users').insert(
      {
        id: randomUUID(),
        last_name: lastName,
        photo_url: photoUrl,
        session_id: sessionId,
        first_name: firstName,
      },
      '*',
    )

    res.send({ user })
  })
}
