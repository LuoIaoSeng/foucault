import fs from "node:fs/promises";

export async function uploadFile(file: File) {
  const baseUrl = 'storage/'
  const ext = await file.name.split('.').at(-1)

  const fileName = `${baseUrl}${crypto.randomUUID()}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  await fs.writeFile('./public/' + fileName, buffer)

  return fileName
}