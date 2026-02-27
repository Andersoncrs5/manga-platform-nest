import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import {Payload} from "../class/payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
        const secret = configService.get<string>('JWT_SECRET');

        if (!secret) {
            throw new Error('JWT_SECRET não encontrado no arquivo .env');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
            issuer: configService.get<string>('ISSUER'),
            audience: configService.get<string>('AUDIENCE'),
        });
    }

    async validate(payload: Payload): Promise<Payload> {
        if (!payload.sub) {
            throw new UnauthorizedException('Token invalid');
        }

       return payload;
    }
}