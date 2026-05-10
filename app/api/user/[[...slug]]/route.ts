import { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { treaty } from "@elysiajs/eden";
import jwt from "@elysiajs/jwt";
import { pasteRegex } from "@tiptap/extension-highlight";
import bcrypt, { genSalt } from "bcryptjs";
import Elysia, { status, t } from "elysia";
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
  .get('/users', async () => {

    const users = await prisma.user.findMany()

    return users.map((user) => {
      return {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatorPath: user.avatorPath,
        firstname: user.firstname,
        lastname: user.lastname,
      }
    })
  })
  .get('/', async ({ user }) => {
    const t = { ...user, password: '' }
    return t
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

    if (user.avatorPath) {
      try {
        await fs.rm('./public/' + user.avatorPath)
      } catch (e) {
        console.error(e)
      }
    }

    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        avatorPath: fileName
      }
    })
    return status('OK')
  }, {
    body: t.Object({
      image: t.File({ format: 'image/*' })
    })
  })
  .group('/admin', (app) =>
    app
      .onBeforeHandle(({ user }) => {
        if (user.role !== 'ADMIN')
          return status('Unauthorized')
      })
      .get('/all', async () => {
        const users = await prisma.user.findMany()
        return users
      })
      .get('/show/:id', async ({ params: { id } }) => {
        const user = await prisma.user.findUnique({ where: { id: parseInt(id) } })
        if (!user) {
          return status(404)
        }
        return user
      })
      .put('/update/:id', async ({ params: { id }, body }) => {
        await prisma.user.update({
          where: { id: parseInt(id) }, data: {
            username: body.username,
            firstname: body.firstname,
            lastname: body.lastname,
            nickname: body.nickname,
            birthday: new Date(body.birthday),
            gender: body.gender,
            role: body.role
          }
        })

        return status('OK')
      }, {
        body: t.Object({
          username: t.String(),
          firstname: t.String(),
          lastname: t.String(),
          nickname: t.String(),
          birthday: t.String(),
          gender: t.String(),
          role: t.Enum(Role)
        })
      })
      .post('/create', async ({ body }) => {
        const newUser = await prisma.user.create({
          data: {
            username: body.username,
            password: await bcrypt.hash(body.password, await genSalt()),
            firstname: body.firstname,
            lastname: body.lastname,
            nickname: body.nickname,
            role: body.role,
            gender: body.gender,
            birthday: new Date(body.birthday || Date.now()),
            createAt: new Date()
          }
        })

        return newUser
      }, {
        body: t.Object({
          username: t.String(),
          password: t.String(),
          firstname: t.String(),
          lastname: t.String(),
          nickname: t.String(),
          role: t.Enum(Role),
          gender: t.String(),
          birthday: t.Optional(t.String())
        })
      })
      .delete('/delete/:id', async ({ params: { id } }) => {
        const userId = parseInt(id);
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
          return status(404);
        }
        if (user.avatorPath) {
          try {
            await fs.rm("./public/" + user.avatorPath);
          } catch {}
        }
        await prisma.user.delete({ where: { id: userId } });
        return status("OK");
      })
      .put('/upload-avator/:id', async ({ body, params: { id } }) => {

        const baseUrl = 'storage/'
        const ext = await body.image.name.split('.').at(-1)

        const fileName = `${baseUrl}${crypto.randomUUID()}.${ext}`

        const arrayBuffer = await body.image.arrayBuffer()
        const buffer = new Uint8Array(arrayBuffer)

        await fs.writeFile('./public/' + fileName, buffer)

        const user = await prisma.user.findUnique({ where: { id: parseInt(id) } })

        if (!user) {
          return status('Unauthorized')
        }

        if (user.avatorPath) {
          try {
            await fs.rm('./public/' + user.avatorPath)
          } catch (e) {

          }
        }

        await prisma.user.update({
          where: {
            id: user.id
          },
          data: {
            avatorPath: fileName
          }
        })
        return status('OK')
      }, {
        body: t.Object({
          image: t.File({ format: 'image/*' })
        })
      })
  )

export const GET = app.fetch
export const POST = app.fetch
export const PUT = app.fetch
export const PATCH = app.fetch
export const DELETE = app.fetch

export const api =
  // process is defined on server side and build time
  typeof process !== 'undefined'
    ? treaty(app).api
    : treaty<typeof app>('localhost:3000').api
