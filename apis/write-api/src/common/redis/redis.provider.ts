import { Provider } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const RedisProvider: Provider = {
    provide: REDIS_CLIENT,
    useFactory: (configService: ConfigService) => {
        return new Redis({
            host: configService.get('REDIS_HOST') || 'localhost',
            port: configService.get('REDIS_PORT') || 6379,
        });
    },
    inject: [ConfigService],
};