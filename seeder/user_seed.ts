import { prisma } from "@/lib/prisma"
import { genSalt, hash } from "bcryptjs"

const main = async () => {
  const user = await prisma.user.create({
    data: {
      username: 'admin',
      password: await hash('admin', await genSalt()),
      name: 'admin',
      createAt: new Date()
    }
  })
  console.log(user)
}

main()
