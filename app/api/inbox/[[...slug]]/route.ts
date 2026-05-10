import { prisma } from "@/lib/prisma";
import { treaty } from "@elysiajs/eden";
import jwt from "@elysiajs/jwt";
import { JsonObject } from "@prisma/client/runtime/client";
import Elysia, { status, t } from "elysia";


export const app = new Elysia({ prefix: '/api/inbox' })
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
    const user = await prisma.user.findUnique({ where: { id: verify.id } })
    if (!user) {
      return status('Bad Request')
    }
    return {
      user
    }
  })
  .resolve(({ user }) => {
    return {
      user
    }
  })
  .get('/', async ({ user }) => {
    const mails = await prisma.inboxMessage.findMany({
      where: {
        receiverId: user.id
      },
      include: { message: { include: { user: true } } }
    })
    return mails.map((mail) => {
      const content = mail.message.content as {
        title: string,
        content: string
      }
      return {
        id: mail.id,
        sender: mail.message.user.nickname,
        title: content.title,
        date: mail.message.createAt
      }
    })
  })
  .get('/:id', async ({ user, params: { id } }) => {
    const mail = await prisma.inboxMessage.findUnique({
      where: {
        id: Number(id)
      },
      include: { message: { include: { user: true } } }
    })

    if(!mail) {
      return status('Bad Request')
    }

    if(mail.receiverId !== user.id) {
      return status('Unauthorized')
    }

    return {
      id: mail.id,
      sender: mail.message.user.nickname,
      content: mail.message.content as {title: string, content: string},
      date: mail.message.createAt
    }
  })
  .get('/sent', async ({ user }) => {
    const mails = await prisma.sendMessage.findMany({
      where: { userId: user.id },
      include: { inboxMessages: { include: { receiveUser: true } } },
      orderBy: { createAt: 'desc' },
    })
    return mails.map((mail) => {
      const content = mail.content as { title: string; content: string }
      return {
        id: mail.id,
        title: content.title,
        receivers: mail.inboxMessages.map((im) => im.receiveUser.nickname),
        date: mail.createAt,
      }
    })
  })
  .post('/send', async ({ user, body }) => {

    const sendMessage = await prisma.sendMessage.create({
      data: {
        userId: user.id,
        content: {
          title: body.title,
          content: body.content
        } as JsonObject
      }
    })

    await prisma.inboxMessage.createMany({
      data: body.receivers.map((id) => {
        return {
          messageId: sendMessage.id,
          receiverId: id
        }
      })
    })

    return status('OK')
  }, {
    body: t.Object({
      title: t.String(),
      receivers: t.Array(t.Integer()),
      content: t.String()
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
