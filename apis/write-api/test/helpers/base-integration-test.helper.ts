import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { MySqlContainer, StartedMySqlContainer } from '@testcontainers/mysql';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { v4 as uuidv4 } from 'uuid';
import {AppModule} from "../../src/app.module";
import {GlobalExceptionFilter} from "../../src/utils/exceptions/all-exceptions.filter";
import {TransformInterceptor} from "../../src/utils/interceptors/transform.interceptor";

export class BaseIntegrationTest {
    protected static app: NestFastifyApplication;
    protected static mysql: StartedMySqlContainer;
    protected static redis: StartedRedisContainer;

    static async setupAll() {
        initializeTransactionalContext();

        this.mysql = await new MySqlContainer('mysql:8.0')
            .withDatabase('manga_platform_db')
            .start();

        this.redis = await new RedisContainer('redis:7-alpine').start();

        process.env.DB_HOST = this.mysql.getHost();
        process.env.DB_PORT = this.mysql.getMappedPort(3306).toString();
        process.env.DB_USER = this.mysql.getUsername();
        process.env.DB_PASSWORD = this.mysql.getUserPassword();
        process.env.DB_NAME = this.mysql.getDatabase();
        process.env.REDIS_HOST = this.redis.getHost();
        process.env.REDIS_PORT = this.redis.getMappedPort(6379).toString();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        this.app = moduleFixture.createNestApplication<NestFastifyApplication>(
            new FastifyAdapter({ genReqId: () => uuidv4() }),
        );

        this.app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
        this.app.useGlobalFilters(new GlobalExceptionFilter());
        this.app.useGlobalInterceptors(new TransformInterceptor());

        await this.app.init();
        await this.app.getHttpAdapter().getInstance().ready();
    }

    static async teardownAll() {
        if (this.app) await this.app.close();
        if (this.mysql) await this.mysql.stop();
        if (this.redis) await this.redis.stop();
    }

    static getApp(): NestFastifyApplication {
        return this.app;
    }
}