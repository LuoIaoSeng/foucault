import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  await prisma.user.create({
    data: {
      username: 'admin',
      password: bcrypt.hashSync('admin', bcrypt.genSaltSync()),
      lastname: 'Admin',
      role: 'ADMIN',
      gender: 'F',
      birthday: new Date()
    }
  })
}

main()
