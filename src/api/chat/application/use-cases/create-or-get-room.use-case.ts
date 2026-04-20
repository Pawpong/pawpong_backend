import { Injectable, Inject } from '@nestjs/common';

import { CHAT_ROOM_MANAGER, type ChatRoomManagerPort, type ChatRoomSnapshot } from '../ports/chat-room-manager.port';
import { CHAT_MESSAGE_BROKER, type ChatMessageBrokerPort } from '../ports/chat-message-broker.port';
import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import type { CreateRoomCommand } from '../types/chat-command.type';

@Injectable()
export class CreateOrGetRoomUseCase {
    constructor(
        @Inject(CHAT_ROOM_MANAGER)
        private readonly chatRoomManager: ChatRoomManagerPort,
        @Inject(CHAT_MESSAGE_BROKER)
        private readonly chatMessageBroker: ChatMessageBrokerPort,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(adopterId: string, command: CreateRoomCommand): Promise<ChatRoomSnapshot> {
        this.logger.logStart('createOrGetRoom', '채팅방 생성/조회 시작', { adopterId, breederId: command.breederId });

        try {
            const existing = await this.chatRoomManager.findRoomByParticipants(adopterId, command.breederId);
            if (existing) {
                this.logger.logSuccess('createOrGetRoom', '기존 채팅방 반환', { roomId: existing.id });
                return existing;
            }

            const room = await this.chatRoomManager.createRoom(adopterId, command.breederId, command.applicationId);

            await this.chatMessageBroker.publishRoomCreated({
                roomId: room.id,
                adopterId,
                breederId: command.breederId,
                applicationId: command.applicationId,
            });

            this.logger.logSuccess('createOrGetRoom', '채팅방 신규 생성', { roomId: room.id });
            return room;
        } catch (error) {
            this.logger.logError('createOrGetRoom', '채팅방 생성/조회', error);
            throw error;
        }
    }
}
