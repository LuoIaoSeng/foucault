import { prisma } from "@/lib/prisma";

async function main() {
  await prisma.user.update({
    where: {
      id: 1
    },
    data: {
      birthday: new Date()
    }
  })
}

main()
