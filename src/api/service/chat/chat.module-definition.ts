import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { Adopter, AdopterSchema } from '../../../schema/adopter.schema';
import { Breeder, BreederSchema } from '../../../schema/breeder.schema';
import { ChatMessage, ChatMessageSchema } from '../../../schema/chat-message.schema';
import { ChatRoom, ChatRoomSchema } from '../../../schema/chat-room.schema';
import { KafkaModule } from '../../../common/kafka/kafka.module';
import { LoggerModule } from '../../../common/logger/logger.module';
import { StorageModule } from '../../../common/storage/storage.module';

import { CHAT_MESSAGE_BROKER } from './application/ports/chat-message-broker.port';
import { CHAT_MESSAGE_MANAGER } from './application/ports/chat-message-manager.port';
import { CHAT_PARTICIPANT_READER } from './application/ports/chat-participant-reader.port';
import { CHAT_ROOM_MANAGER } from './application/ports/chat-room-manager.port';
import {
    CLOSE_ROOM_USE_CASE,
    CREATE_OR_GET_ROOM_USE_CASE,
    GET_MESSAGES_USE_CASE,
    GET_MY_ROOMS_USE_CASE,
    SEND_MESSAGE_USE_CASE,
} from './application/ports/chat-interaction.port';
import { CloseRoomUseCase } from './application/use-cases/close-room.use-case';
import { CreateOrGetRoomUseCase } from './application/use-cases/create-or-get-room.use-case';
import { GetMessagesUseCase } from './application/use-cases/get-messages.use-case';
import { GetMyRoomsUseCase } from './application/use-cases/get-my-rooms.use-case';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import { ChatMessageMapperService } from './domain/services/chat-message-mapper.service';
import { ChatPolicyService } from './domain/services/chat-policy.service';
import { ChatRoomMapperService } from './domain/services/chat-room-mapper.service';
import { ChatRoomResponseAssemblerService } from './domain/services/chat-room-response-assembler.service';
import { ChatParticipantMongooseReaderAdapter } from './infrastructure/chat-participant-mongoose-reader.adapter';
import { KafkaChatMessageBrokerAdapter } from './infrastructure/kafka-chat-message-broker.adapter';
import { ChatMongooseManagerAdapter } from './infrastructure/chat-mongoose-manager.adapter';
import { ChatRepository } from './repository/chat.repository';
import { ChatGateway } from './chat.gateway';
import { ChatKafkaConsumer } from './chat-kafka.consumer';
import { ChatRoomCommandController } from './controller/chat-room-command.controller';
import { ChatRoomQueryController } from './controller/chat-room-query.controller';

const CHAT_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: ChatRoom.name, schema: ChatRoomSchema },
    { name: ChatMessage.name, schema: ChatMessageSchema },
    { name: Adopter.name, schema: AdopterSchema },
    { name: Breeder.name, schema: BreederSchema },
]);

const CHAT_JWT_IMPORT = JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
    }),
    inject: [ConfigService],
});

export const CHAT_MODULE_IMPORTS = [CHAT_SCHEMA_IMPORTS, StorageModule, KafkaModule, LoggerModule, CHAT_JWT_IMPORT];

export const CHAT_MODULE_CONTROLLERS = [ChatRoomCommandController, ChatRoomQueryController, ChatKafkaConsumer];

const CHAT_PRESENTATION_PROVIDERS = [ChatGateway];

const CHAT_APPLICATION_PROVIDERS = [
    CreateOrGetRoomUseCase,
    GetMyRoomsUseCase,
    SendMessageUseCase,
    GetMessagesUseCase,
    CloseRoomUseCase,
];

const CHAT_DOMAIN_PROVIDERS = [
    ChatPolicyService,
    ChatRoomMapperService,
    ChatMessageMapperService,
    ChatRoomResponseAssemblerService,
];

const CHAT_INFRASTRUCTURE_PROVIDERS = [
    ChatRepository,
    ChatMongooseManagerAdapter,
    KafkaChatMessageBrokerAdapter,
    ChatParticipantMongooseReaderAdapter,
];

const CHAT_PORT_BINDINGS = [
    { provide: CHAT_ROOM_MANAGER, useExisting: ChatMongooseManagerAdapter },
    { provide: CHAT_MESSAGE_MANAGER, useExisting: ChatMongooseManagerAdapter },
    { provide: CHAT_MESSAGE_BROKER, useExisting: KafkaChatMessageBrokerAdapter },
    { provide: CHAT_PARTICIPANT_READER, useExisting: ChatParticipantMongooseReaderAdapter },
];

const CHAT_USE_CASE_BINDINGS = [
    { provide: CREATE_OR_GET_ROOM_USE_CASE, useExisting: CreateOrGetRoomUseCase },
    { provide: GET_MY_ROOMS_USE_CASE, useExisting: GetMyRoomsUseCase },
    { provide: SEND_MESSAGE_USE_CASE, useExisting: SendMessageUseCase },
    { provide: GET_MESSAGES_USE_CASE, useExisting: GetMessagesUseCase },
    { provide: CLOSE_ROOM_USE_CASE, useExisting: CloseRoomUseCase },
];

export const CHAT_MODULE_PROVIDERS = [
    ...CHAT_PRESENTATION_PROVIDERS,
    ...CHAT_APPLICATION_PROVIDERS,
    ...CHAT_DOMAIN_PROVIDERS,
    ...CHAT_INFRASTRUCTURE_PROVIDERS,
    ...CHAT_PORT_BINDINGS,
    ...CHAT_USE_CASE_BINDINGS,
];

export const CHAT_MODULE_EXPORTS = [
    CREATE_OR_GET_ROOM_USE_CASE,
    GET_MY_ROOMS_USE_CASE,
    SEND_MESSAGE_USE_CASE,
    GET_MESSAGES_USE_CASE,
    CLOSE_ROOM_USE_CASE,
];
