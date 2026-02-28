import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PassportModule } from '@nestjs/passport';
import {UserModule} from "../user/user.module";

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');

        if (!secret) {
          throw new Error('JWT_SECRET não definido no arquivo .env');
        }

        return {
          secret: secret,
          signOptions: {
            expiresIn: (config.get<string>('JWT_EXPIRES_IN')) as any,
            issuer: config.get<string>('ISSUER'),
            audience: config.get<string>('AUDIENCE'),
            algorithm: config.get<any>('ALGORITHM'),
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}