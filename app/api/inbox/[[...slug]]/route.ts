import { uploadFile } from "@/lib/filehelper";
import { treaty } from "@elysiajs/eden";
import jwt from "@elysiajs/jwt";
import Elysia, { t } from "elysia";

export const app = new Elysia({ prefix: '/api/inbox' })
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_KEY!
  }))
  .post('/upload-image', async ({ body }) => {

    const filePath = await uploadFile(body.image)

    return {
      path: '/' + filePath
    }
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
