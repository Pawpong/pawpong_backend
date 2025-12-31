import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KafkaService } from './kafka.service';

/**
 * Kafka 모듈
 * - 채팅 메시지 처리
 * - 유저 플로우 이벤트 로깅
 */
@Global()
@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'KAFKA_SERVICE',
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.KAFKA,
                    options: {
                        client: {
                            clientId: 'pawpong-backend',
                            brokers: [configService.get<string>('KAFKA_BROKER', 'kafka:29092')],
                            connectionTimeout: 10000,
                            retry: {
                                initialRetryTime: 100,
                                retries: 8,
                            },
                        },
                        consumer: {
                            groupId: 'pawpong-consumer-group',
                            allowAutoTopicCreation: true,
                        },
                        producer: {
                            allowAutoTopicCreation: true,
                        },
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    providers: [KafkaService],
    exports: [KafkaService, ClientsModule],
})
export class KafkaModule {}
