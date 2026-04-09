import { Injectable, Inject } from '@nestjs/common';

import { CHAT_ROOM_MANAGER, type ChatRoomManagerPort, type ChatRoomSnapshot } from '../ports/chat-room-manager.port';
import { KafkaService, KafkaTopic } from '../../../../common/kafka/kafka.service';
import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { CreateRoomRequestDto } from '../../dto/request/create-room-request.dto';

@Injectable()
export class CreateOrGetRoomUseCase {
    constructor(
        @Inject(CHAT_ROOM_MANAGER)
        private readonly chatRoomManager: ChatRoomManagerPort,
        private readonly kafkaService: KafkaService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(adopterId: string, dto: CreateRoomRequestDto): Promise<ChatRoomSnapshot> {
        const existing = await this.chatRoomManager.findRoomByParticipants(adopterId, dto.breederId);
        if (existing) {
            return existing;
        }

        const room = await this.chatRoomManager.createRoom(adopterId, dto.breederId, dto.applicationId);

        await this.kafkaService.emit(KafkaTopic.CHAT_ROOM_CREATED, {
            roomId: room.id,
            adopterId,
            breederId: dto.breederId,
            applicationId: dto.applicationId,
        });

        this.logger.logSuccess('CreateOrGetRoomUseCase', `채팅방 생성: ${room.id}`);
        return room;
    }
}
