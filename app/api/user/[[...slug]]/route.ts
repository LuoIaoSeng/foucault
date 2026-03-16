import { prisma } from "@/lib/prisma"
import { treaty } from "@elysiajs/eden"
import jwt from "@elysiajs/jwt"
import Elysia, { status } from "elysia"

export const app = new Elysia({ prefix: '/api/user' })
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_KEY!
  }))
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
    return {
      user
    }
  })
  .get('/', async ({ user }) => {
    return user
  })

export const GET = app.fetch
export const POST = app.fetch

export const api =
  // process is defined on server side and build time
  typeof process !== 'undefined'
    ? treaty(app).api
    : treaty<typeof app>('localhost:3000').api
