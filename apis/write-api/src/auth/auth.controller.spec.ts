import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {CreateUserDto} from "../user/dto/create-user.dto";
import {LoginResponse} from "./class/login.response";
import {IntegrationTestHelper} from "../../test/helpers/integration-test.helper";
import {ResponseHTTP} from "../utils/res/responseHttp.res";
import {BaseIntegrationTest} from "../../test/helpers/base-integration-test.helper";
import {LoginUserDto} from "./dto/login-user.dto";
import {UserTestResult} from "../../test/classes/user-test-result.interface";

describe('AuthController (Integration)', () => {
  let helper: IntegrationTestHelper;
  let app: INestApplication;

  beforeAll(async () => {
    await BaseIntegrationTest.setupAll();

    app = BaseIntegrationTest.getApp();
    helper = new IntegrationTestHelper((BaseIntegrationTest as any).app);
  }, 180000);

  describe('POST /register', () => {
    const path = '/v1/auth/register';

    it('You must register a new user and validate the typed object.', async () => {
      const dto: CreateUserDto = {
        name: 'Darkness',
        username: 'darkness_dev' + helper.getRandomInt(),
        email: `dev${helper.getRandomInt()}@manga.com`,
        password: 'Password123!'
      };

      const res = await request(app.getHttpServer())
          .post(path)
          .send(dto);

      const response = res.body as ResponseHTTP<LoginResponse>;

      expect(response.path).toBe(path);
      expect(response.traceId).toBeDefined();

      expect(response.body.user.id).toBeDefined();
      expect(response.body.user.username).toBe(dto.username);
      expect(response.body.user.email).toBe(dto.email);
      expect(response.body.roles.length).toBe(1);
      expect(response.body.tokens.token).toBeDefined();
      expect(response.body.tokens.refreshToken).toBeDefined();

    }, 3000);

    it('should return 400 status because username already exists', async () => {
      const dto: CreateUserDto = {
        name: 'Darkness',
        username: 'darkness_dev' + helper.getRandomInt(),
        email: `dev${helper.getRandomInt()}@manga.com`,
        password: 'Password123!'
      };

      await helper.registerUser(dto);

      const res = await request(app.getHttpServer())
          .post(path)
          .send(dto);

      expect(res.status).toBe(400);

      const response = res.body as ResponseHTTP<null> ;

      expect(response.body).toBeNull()

      expect(response.message).toContain("username")
    }, 3000);

    it('should return 400 status because email already exists', async () => {
      const dto: CreateUserDto = {
        name: 'Darkness',
        username: 'darkness_dev' + helper.getRandomInt(),
        email: `dev${helper.getRandomInt()}@manga.com`,
        password: 'Password123!'
      };

      await helper.registerUser(dto);

      dto.username += "1111"

      const res = await request(app.getHttpServer())
          .post(path)
          .send(dto);

      console.log(res)

      expect(res.status).toBe(400);

      const response = res.body as ResponseHTTP<null> ;

      expect(response.body).toBeNull()

      expect(response.message).toContain("email")
    }, 3000);
  })

  describe('POST /login', () => {
    const path = '/v1/auth/login';

    it('Should make login ', async () => {
      const http = await helper.createUser();

      const dto: LoginUserDto = {
        email: http.dto.email,
        password: http.dto.password,
      }

      const res = await request(app.getHttpServer())
          .post(path)
          .send(dto);

      expect(res.status).toBe(200);

      const response = res.body as ResponseHTTP<LoginResponse>;
      expect(response.body).not.toBeNull()

      expect(response.traceId).toBeDefined();

      expect(response.body.user.id).toBe(http.user.id);

      expect(response.body.tokens.token).toBeDefined();
      expect(response.body.tokens.refreshToken).toBeDefined();
    })

    it('should return 401 because email', async () => {
      const dto: LoginUserDto = {
        email: 'cleitinofgrau@gmail.com',
        password: '12345678',
      }

      const res = await request(app.getHttpServer())
          .post(path)
          .send(dto);

      expect(res.status).toBe(401);

      const response = res.body as ResponseHTTP<null>;
      expect(response.body).toBeNull()

      expect(response.traceId).toBeDefined();
      expect(response.path).toBe(path);
    });

    it('Should return 401 because password wrong', async () => {
      const http = await helper.createUser();

      const dto: LoginUserDto = {
        email: http.dto.email,
        password: "43353513464526245624",
      }

      const responseLogin = await request(app.getHttpServer())
          .post(path)
          .send(dto);

      console.log(responseLogin);

      expect(responseLogin.status).toBe(401);

      const response = responseLogin.body as ResponseHTTP<null>;
      expect(response.body).toBeNull()

      expect(response.traceId).toBeDefined();
      expect(response.path).toBe(path);
    })


  })

  describe('PATCH /logout', () => {
    const path = '/v1/auth/logout';

    it('Should make logout', async () => {
      const response: UserTestResult = await helper.createUser();
      const token: string = response.login.tokens.token;

      const res = await request(app.getHttpServer())
          .patch(path)
          .set('Authorization', `Bearer ${token}`)
          .send();

      expect(res.status).toBe(200);
      expect(res.body.message).toBeDefined();
    });

    it('Should return 401 logout ', async () => {
      const http: UserTestResult = await helper.createUser();

      const response = await request(app.getHttpServer())
          .patch(path);

      expect(response.status).toBe(401);
    })
  })

});
