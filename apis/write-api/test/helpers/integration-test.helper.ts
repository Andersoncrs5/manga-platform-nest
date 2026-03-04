import {INestApplication} from '@nestjs/common';
import request from 'supertest';
import {LoginResponse} from '../../src/auth/class/login.response';
import {ResponseHTTP} from "../../src/utils/res/responseHttp.res";
import {CreateUserDto} from "../../src/user/dto/create-user.dto";
import {UserTestResult} from "../classes/user-test-result.interface";

export class IntegrationTestHelper {
    constructor(private readonly app: INestApplication) {}

    async post<T>(url: string, payload: any, token?: string): Promise<T> {
        const req = request(this.app.getHttpServer()).post(url);

        if (token) {
            req.set('Authorization', `Bearer ${token}`);
        }

        const res = await req.send(payload);

        expect(res.status).toBeGreaterThanOrEqual(200);
        expect(res.status).toBeLessThan(300);

        const response = res.body as ResponseHTTP<T>;

        expect(response.message).toBeDefined();
        expect(response.traceId).toBeDefined();

        return response.body;
    }

    async registerUser(dto: any): Promise<LoginResponse> {
        return this.post<LoginResponse>('/v1/auth/register', dto);
    }

    async createUser(): Promise<UserTestResult> {
        const dto: CreateUserDto = {
            name: 'Darkness',
            username: 'darkness_dev' + this.getRandomInt(),
            email: `dev${this.getRandomInt()}@manga.com`,
            password: '1234567890!'
        };

        const result = await this.post<LoginResponse>('/v1/auth/register', dto);

        return {
            dto: dto,
            login: result,
            user: result.user
        };
    }

    getRandomInt = (min: number = 1, max: number= 10000000000): number => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

}