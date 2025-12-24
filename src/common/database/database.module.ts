import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            useFactory: async (configService: ConfigService) => {
                // APP_ENV에 따라 MongoDB URI 선택
                const appEnv = configService.get<string>('APP_ENV') || 'local';
                let uri: string | undefined;

                if (appEnv === 'local') {
                    uri = configService.get<string>('MONGODB_URI_LOCAL');
                } else if (appEnv === 'dev') {
                    uri = configService.get<string>('MONGODB_URI_DEV');
                } else {
                    // prod
                    uri = configService.get<string>('MONGODB_URI_PROD');
                }

                if (!uri) {
                    throw new Error(`MongoDB URI not found for environment: ${appEnv}`);
                }

                console.log('[DatabaseModule] APP_ENV:', appEnv);
                console.log('[DatabaseModule] MongoDB URI:', uri.replace(/:[^:]*@/, ':****@'));
                console.log('[DatabaseModule] Connecting to MongoDB...');

                return {
                    uri: uri,
                    retryAttempts: 2,
                    retryDelay: 500,
                    serverSelectionTimeoutMS: 3000,
                    connectTimeoutMS: 5000,
                    socketTimeoutMS: 10000,
                };
            },
            inject: [ConfigService],
        }),
    ],
    exports: [MongooseModule],
})
export class DatabaseModule {}
