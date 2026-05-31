const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function hashExistingPasswords() {
  try {
    // Найти всех пользователей с незахешированными паролями
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { passwordHash: { contains: ' ' } }, // Простые пароли
          { passwordHash: { startsWith: '$2' } } // Уже захешированные
        ]
      }
    });

    console.log(`Найдено пользователей: ${users.length}`);

    for (const user of users) {
      // Проверить, не захеширован ли уже пароль
      const isAlreadyHashed = user.passwordHash.startsWith('$2');
      
      if (!isAlreadyHashed) {
        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(user.passwordHash, 10);
        
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: hashedPassword }
        });
        
        console.log(`✅ Захеширован пароль для ${user.email}`);
      }
    }

    console.log('✅ Миграция паролей завершена!');
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

hashExistingPasswords();