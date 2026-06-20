import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { ChatRoom, ChatRoomSchema } from '../../schema/chat-room.schema';
import { ChatMessage, ChatMessageSchema } from '../../schema/chat-message.schema';
import { Adopter, AdopterSchema } from '../../schema/adopter.schema';
import { Breeder, BreederSchema } from '../../schema/breeder.schema';
import { StorageModule } from '../../common/storage/storage.module';

import { ChatRoomCommandController } from './controller/chat-room-command.controller';
import { ChatRoomQueryController } from './controller/chat-room-query.controller';
import { ChatGateway } from './chat.gateway';
import { ChatKafkaConsumer } from './chat-kafka.consumer';

import { ChatRepository } from './repository/chat.repository';
import { ChatMongooseManagerAdapter } from './infrastructure/chat-mongoose-manager.adapter';
import { KafkaChatMessageBrokerAdapter } from './infrastructure/kafka-chat-message-broker.adapter';
import { ChatPolicyService } from './domain/services/chat-policy.service';
import { ChatRoomMapperService } from './domain/services/chat-room-mapper.service';
import { ChatMessageMapperService } from './domain/services/chat-message-mapper.service';
import { ChatRoomResponseAssemblerService } from './domain/services/chat-room-response-assembler.service';

import { CreateOrGetRoomUseCase } from './application/use-cases/create-or-get-room.use-case';
import { GetMyRoomsUseCase } from './application/use-cases/get-my-rooms.use-case';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import { GetMessagesUseCase } from './application/use-cases/get-messages.use-case';
import { CloseRoomUseCase } from './application/use-cases/close-room.use-case';

import { CHAT_ROOM_MANAGER } from './application/ports/chat-room-manager.port';
import { CHAT_MESSAGE_MANAGER } from './application/ports/chat-message-manager.port';
import { CHAT_MESSAGE_BROKER } from './application/ports/chat-message-broker.port';
import { CHAT_PARTICIPANT_READER } from './application/ports/chat-participant-reader.port';
import { ChatParticipantMongooseReaderAdapter } from './infrastructure/chat-participant-mongoose-reader.adapter';
import {
    CREATE_OR_GET_ROOM_USE_CASE,
    GET_MY_ROOMS_USE_CASE,
    SEND_MESSAGE_USE_CASE,
    GET_MESSAGES_USE_CASE,
    CLOSE_ROOM_USE_CASE,
} from './application/tokens/chat-interaction.token';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ChatRoom.name, schema: ChatRoomSchema },
            { name: ChatMessage.name, schema: ChatMessageSchema },
            { name: Adopter.name, schema: AdopterSchema },
            { name: Breeder.name, schema: BreederSchema },
        ]),
        StorageModule,
        JwtModule.registerAsync({
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [ChatRoomCommandController, ChatRoomQueryController, ChatKafkaConsumer],
    providers: [
        ChatGateway,
        ChatRepository,

        // Domain services
        ChatPolicyService,
        ChatRoomMapperService,
        ChatMessageMapperService,
        ChatRoomResponseAssemblerService,

        // Adapters
        ChatMongooseManagerAdapter,
        KafkaChatMessageBrokerAdapter,
        ChatParticipantMongooseReaderAdapter,

        // Port → Adapter 바인딩
        { provide: CHAT_ROOM_MANAGER, useExisting: ChatMongooseManagerAdapter },
        { provide: CHAT_MESSAGE_MANAGER, useExisting: ChatMongooseManagerAdapter },
        { provide: CHAT_MESSAGE_BROKER, useExisting: KafkaChatMessageBrokerAdapter },
        { provide: CHAT_PARTICIPANT_READER, useExisting: ChatParticipantMongooseReaderAdapter },

        // Use Cases
        CreateOrGetRoomUseCase,
        GetMyRoomsUseCase,
        SendMessageUseCase,
        GetMessagesUseCase,
        CloseRoomUseCase,

        // Use Case Port 바인딩 (외부 모듈 주입용)
        { provide: CREATE_OR_GET_ROOM_USE_CASE, useExisting: CreateOrGetRoomUseCase },
        { provide: GET_MY_ROOMS_USE_CASE, useExisting: GetMyRoomsUseCase },
        { provide: SEND_MESSAGE_USE_CASE, useExisting: SendMessageUseCase },
        { provide: GET_MESSAGES_USE_CASE, useExisting: GetMessagesUseCase },
        { provide: CLOSE_ROOM_USE_CASE, useExisting: CloseRoomUseCase },
    ],
    exports: [
        CREATE_OR_GET_ROOM_USE_CASE,
        GET_MY_ROOMS_USE_CASE,
        SEND_MESSAGE_USE_CASE,
        GET_MESSAGES_USE_CASE,
        CLOSE_ROOM_USE_CASE,
    ],
})
export class ChatModule {}
