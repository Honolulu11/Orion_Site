// create-test-user.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createTestUser() {
  const hashedPassword = await bcrypt.hash('test123', 10);
  
  const user = await prisma.user.create({
    data: {
      email: 'test@test.ru',
      passwordHash: hashedPassword,
      firstName: 'Тест',
      lastName: 'Пользователь',
      userType: 'PRIVATE'
    }
  });
  
  console.log('✅ Пользователь создан:', user.email);
  console.log('Пароль: test123');
}

createTestUser().catch(console.error).finally(() => prisma.$disconnect());