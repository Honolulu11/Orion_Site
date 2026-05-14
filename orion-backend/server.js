require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Orion Backend running on port ${PORT}`);
  console.log(`📊 Prisma Studio: http://localhost:5555`);
});