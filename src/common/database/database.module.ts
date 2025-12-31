import { Module, Logger, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            useFactory: async (configService: ConfigService) => {
                const uri = configService.get<string>('MONGODB_URI');
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
export class DatabaseModule implements OnModuleInit {
    private readonly logger = new Logger('Database');

    constructor(@InjectConnection() private readonly connection: Connection) {}

    onModuleInit() {
        const dbName = this.connection.db?.databaseName || 'pawpong';
        this.logger.log(`MongoDB 연결 성공 (DB: ${dbName})`);
    }
}
