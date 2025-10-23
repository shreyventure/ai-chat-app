const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create AI user
  const aiUser = await prisma.user.upsert({
    where: { email: 'ai@abc.com' },
    update: {},
    create: {
      email: 'ai@abc.com',
      name: 'AI Assistant',
      image: 'https://lh3.googleusercontent.com/a/ACg8ocJ6eljr_dL_-0H1zKrpFlamsuKKa3uS7SYQtsjjC7CTDn12fQ=s96-c',
    },
  });

  console.log('✅ AI user created/updated:', aiUser);
  console.log('🌱 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });