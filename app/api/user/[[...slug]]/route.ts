import { prisma } from "@/lib/prisma"
import { treaty } from "@elysiajs/eden"
import jwt from "@elysiajs/jwt"
import Elysia, { status, t } from "elysia"
import fs from "node:fs/promises";


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
    if (!user) {
      return status('Bad Request')
    }
    return {
      user
    }
  })
  .get('/', async ({ user }) => {
    return user
  })
  .put('/', async ({ user, body }) => {

    await prisma.user.update({
      where: { id: user.id },
      data: body
    })

    return status('OK')
  }, {
    body: t.Object({
      nickname: t.String()
    })
  })
  .put('/upload-avator', async ({ user, body }) => {

    const baseUrl = 'storage/'
    const ext = await body.image.name.split('.').at(-1)

    const fileName = `${baseUrl}${crypto.randomUUID()}.${ext}`

    const arrayBuffer = await body.image.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    await fs.writeFile('./public/' + fileName, buffer)

    if (user.avator_path) {
      try {
        await fs.rm('./public/' + user.avator_path)
      } catch (e) {

      }
    }

    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        avator_path: fileName
      }
    })
    return status('OK')
  }, {
    body: t.Object({
      image: t.File({ format: 'image/*' })
    })
  })

export const GET = app.fetch
export const POST = app.fetch
export const PUT = app.fetch
export const PATCH = app.fetch

export const api =
  // process is defined on server side and build time
  typeof process !== 'undefined'
    ? treaty(app).api
    : treaty<typeof app>('localhost:3000').api
