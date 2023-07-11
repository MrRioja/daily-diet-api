import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { knex } from '../database'
import { checkSessionIdSession } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [checkSessionIdSession],
    },
    async (req: FastifyRequest, res: FastifyReply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.coerce.date(),
        time: z.string(),
        onDiet: z.boolean(),
      })

      const validationResult = createMealBodySchema.safeParse(req.body)

      if (!validationResult.success) {
        return res.status(400).send({
          message: validationResult.error.errors,
        })
      }

      const { name, description, date, time, onDiet } = validationResult.data

      const { sessionId } = req.cookies

      const { id } = await knex('users')
        .select('id')
        .where({ session_id: sessionId })
        .first()

      const meal = await knex('meals')
        .insert({
          id: randomUUID(),
          name,
          description,
          date: date.toISOString(),
          time,
          on_diet: onDiet,
          user_id: id,
        })
        .returning('*')

      res.status(201).send({ meal })
    },
  )

  app.put(
    '/:id',
    {
      preHandler: [checkSessionIdSession],
    },
    async (req: FastifyRequest, res: FastifyReply) => {
      const editMealParams = z.object({
        id: z.string(),
      })

      const editMealBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        date: z.coerce.date().optional(),
        time: z.string().optional(),
        onDiet: z.boolean().optional(),
      })

      const validationResult = editMealBodySchema.safeParse(req.body)

      if (!validationResult.success) {
        return res.status(400).send({
          message: validationResult.error.errors,
        })
      }

      const { id } = editMealParams.parse(req.params)
      const { name, description, date, time, onDiet } = validationResult.data

      const meal = await knex('meals')
        .select('*')
        .where({ id })
        .first()
        .update({
          name,
          description,
          date,
          time,
          on_diet: onDiet,
          updated_at: new Date(),
        })
        .returning('*')

      res.status(200).send({ meal })
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdSession],
    },
    async (req: FastifyRequest, res: FastifyReply) => {
      const deleteMealParams = z.object({
        id: z.string(),
      })

      const { id } = deleteMealParams.parse(req.params)

      await knex('meals').where({ id }).del()

      res.status(204).send()
    },
  )

  app.get(
    '/',
    {
      preHandler: [checkSessionIdSession],
    },
    async (req: FastifyRequest, res: FastifyReply) => {
      const { sessionId } = req.cookies

      const { id } = await knex('users')
        .select('id')
        .where({ session_id: sessionId })
        .first()

      const meals = await knex('meals')
        .select('*')
        .where({ user_id: id })
        .orderBy('date', 'desc')

      res.status(200).send({ meals })
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdSession],
    },
    async (req: FastifyRequest, res: FastifyReply) => {
      const getMealParams = z.object({
        id: z.string(),
      })

      const { sessionId } = req.cookies

      const { id: userId } = await knex('users')
        .select('id')
        .where({ session_id: sessionId })
        .first()

      const { id } = getMealParams.parse(req.params)

      const meal = await knex('meals')
        .select('*')
        .where({ id, user_id: userId })
        .first()

      res.status(200).send({ meal })
    },
  )
}
