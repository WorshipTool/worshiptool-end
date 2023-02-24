import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const cors = require("cors");
  app.use(cors());
  await app.listen(parseInt(process.env.LISTENS_PORT, 10) || 3300);
}
bootstrap();
