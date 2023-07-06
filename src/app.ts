import { fastify } from 'fastify'
import cookie from '@fastify/cookie'

import { mealsRoutes } from './routes/meals-routes'
import { usersRoutes } from './routes/users-routes'

export const app = fastify()

app.register(cookie)

app.register(mealsRoutes, {
  prefix: 'meals',
})

app.register(usersRoutes, {
  prefix: 'users',
})
