import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MySqlContainer, StartedMySqlContainer } from '@testcontainers/mysql';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';
import { AppModule } from '../app.module';
import {initializeTransactionalContext} from "typeorm-transactional";
import {CreateUserDto} from "../user/dto/create-user.dto";

describe('AuthController (Integration)', () => {
  let app: INestApplication;
  let mysql: StartedMySqlContainer;
  let redis: StartedRedisContainer;

  beforeAll(async () => {
    initializeTransactionalContext();

    mysql = await new MySqlContainer('mysql:8.0')
        .withDatabase('manga_platform_db')
        .start();

    redis = await new RedisContainer('redis:7-alpine').start();

    process.env.DB_HOST = mysql.getHost();
    process.env.DB_PORT = mysql.getMappedPort(3306).toString();
    process.env.DB_USER = mysql.getUsername();
    process.env.DB_PASSWORD = mysql.getUserPassword();
    process.env.DB_NAME = mysql.getDatabase();

    process.env.REDIS_HOST = redis.getHost();
    process.env.REDIS_PORT = redis.getMappedPort(6379).toString();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  }, 180000);

  afterAll(async () => {
    if (app) await app.close();
    if (mysql) await mysql.stop();
    if (redis) await redis.stop();
  });

  it('Deve registrar um novo usuário e retornar status 201', async () => {
    const dto: CreateUserDto = {
      name: 'Darkness',
      username: 'darkness_dev',
      email: 'dev@manga.com',
      password: 'Password123!'
    }

    const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto);

    expect(res.status).toBe(201);
    
  });
});