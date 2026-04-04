import { prisma } from "@/lib/prisma"
import { treaty } from "@elysiajs/eden"
import jwt from "@elysiajs/jwt"
import bcrypt, { compare } from "bcryptjs"
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
      role: user.role
    }

  }, {
    body: t.Object({
      username: t.String({ minLength: 4 }),
      password: t.String({ minLength: 4 })
    })
  })
  .post('/logout', async ({ cookie: { auth } }) => {
    auth.remove()
    return status('OK')
  })
  .onBeforeHandle(async ({ jwt, cookie: { auth } }) => {
    const verify = await jwt.verify(auth.value as string)
    if (!verify) {
      return status('Unauthorized')
    }
  })
  .derive(async ({ jwt, cookie: { auth } }) => {
    const verify = await jwt.verify(auth.value as string) as {
      id: number
    }
    const user = await prisma.user.findUnique({ where: { id: Number(verify.id) } })
    if (!user) {
      return status('Bad Request')
    }
    return {
      user
    }
  })
  .post('/reset-password', async ({ user, body }) => {
    if (body.password !== body.confirmPassword) {
      return status('Unprocessable Content')
    }
    if (body.password.length === 0) {
      return status('Unprocessable Content')
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(body.password, await bcrypt.genSalt()) }
    })

    return status('OK')
  }, {
    body: t.Object({
      password: t.String(),
      confirmPassword: t.String()
    })
  })

export const GET = app.fetch
export const POST = app.fetch

export const api =
  // process is defined on server side and build time
  typeof process !== 'undefined'
    ? treaty(app).api
    : treaty<typeof app>('localhost:3000').api
