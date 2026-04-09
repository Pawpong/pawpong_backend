import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatRepository } from './chat.repository';

import { ChatRoom, ChatRoomSchema } from '../../schema/chat-room.schema';
import { ChatMessage, ChatMessageSchema } from '../../schema/chat-message.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ChatRoom.name, schema: ChatRoomSchema },
            { name: ChatMessage.name, schema: ChatMessageSchema },
        ]),
        JwtModule.registerAsync({
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [ChatController],
    providers: [ChatGateway, ChatService, ChatRepository],
    exports: [ChatService],
})
export class ChatModule {}
