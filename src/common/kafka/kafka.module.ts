import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Partitioners } from 'kafkajs';
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
                            connectionTimeout: 5000,
                            requestTimeout: 5000,
                            retry: {
                                initialRetryTime: 100,
                                retries: 3,
                            },
                        },
                        consumer: {
                            groupId: 'pawpong-consumer-group',
                            allowAutoTopicCreation: true,
                        },
                        producer: {
                            allowAutoTopicCreation: true,
                            createPartitioner: Partitioners.DefaultPartitioner,
                        },
                        // 이 ClientKafka는 이벤트 발행 전용이다. 별도 consumer를 만들지 않아
                        // 테스트 종료 핸들과 불필요한 consumer group 연결을 남기지 않는다.
                        producerOnlyMode: true,
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
