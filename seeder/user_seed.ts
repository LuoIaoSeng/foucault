import { prisma } from "@/lib/prisma"
import { genSalt, hash } from "bcryptjs"

const main = async () => {
  const user = await prisma.user.create({
    data: {
      username: "admin",
      password: await hash("admin", await genSalt()),
      firstname: "Admin",
      lastname: "User",
      gender: "M",
      birthday: new Date("2000-01-01"),
    },
  });
  console.log(user)
}

main()
