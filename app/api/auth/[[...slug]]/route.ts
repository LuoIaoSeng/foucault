import { prisma } from "@/lib/prisma"
import { treaty } from "@elysiajs/eden"
import jwt from "@elysiajs/jwt"
import { compare } from "bcryptjs"
import Elysia, { status, t } from "elysia"

export const app = new Elysia({ prefix: '/api/auth' })
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_KEY!
  }))
  .post('/login', async ({ body, jwt, cookie: { auth } }) => {

    const user = await prisma.user.findUnique({
      where: {
        username: body.username,
      }
    })

    if (!user) {
      return status('Unauthorized', {
        message: 'Incorrect username or password',
      })
    }

    if (!await compare(body.password, user.password)) {
      return status('Unauthorized', {
        message: 'Incorrect username or password',
      })
    }

    const value = await jwt.sign({ id: user.id })

    auth.set({
      value,
      httpOnly: true,
      maxAge: 7 * 86400
    })

    return {
      message: 'ok'
    }

  }, {
    body: t.Object({
      username: t.String({ minLength: 4 }),
      password: t.String({ minLength: 4 })
    })
  })

export const GET = app.fetch
export const POST = app.fetch

export const api =
  // process is defined on server side and build time
  typeof process !== 'undefined'
    ? treaty(app).api
    : treaty<typeof app>('localhost:3000').api
