import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
    .setTitle('WorshipTool API')
    .setDescription("API for WorshipTool app")
    .addBearerAuth()
    .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);


    const cors = require("cors");
    app.use(cors());
    await app.listen(parseInt(process.env.LISTENS_PORT, 10) || 3300);
}
bootstrap();
