import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const legacyUser = await prisma.user.upsert({
    where: { email: 'legacy@example.com' },
    update: {},
    create: {
      name: 'Legacy User',
      email: 'legacy@example.com',
      role: 'USER',
    },
  })

  console.log({ legacyUser })

  // 既存のインシデントを更新
  await prisma.incident.updateMany({
    where: {
      userId: undefined // nullをundefinedに変更
    },
    data: {
      userId: legacyUser.id
    }
  })

  console.log('Updated existing incidents with legacy user ID')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })