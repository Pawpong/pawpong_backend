import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            useFactory: async (configService: ConfigService) => {
                const uri = configService.get<string>('MONGODB_URI');
                console.log('[DatabaseModule] MongoDB URI:', uri ? uri.replace(/:[^:]*@/, ':****@') : 'NOT SET');
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
