import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import {addTransactionalDataSource, getDataSourceByName} from 'typeorm-transactional';
import { User } from './user/entities/user.entity';
import {UserModule} from "./user/user.module";
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { UserRoleModule } from './user-role/user-role.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mysql',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          entities: [User],
          autoLoadEntities: true,
          synchronize: true,
        };
      },
      async dataSourceFactory(options) {
        if (!options) throw new Error('Invalid options passed');

        const existingInstance = getDataSourceByName('default');
        if (existingInstance) return existingInstance;

        return addTransactionalDataSource(new DataSource(options));
      },
    }),
    UserModule,
    AuthModule,
    RoleModule,
    UserRoleModule,
  ],
})
export class AppModule {}