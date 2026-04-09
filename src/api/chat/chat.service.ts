import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';

import { ChatRepository } from './chat.repository';
import { KafkaService, KafkaTopic } from '../../common/kafka/kafka.service';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';

import { ChatRoomDocument } from '../../schema/chat-room.schema';
import { ChatMessageDocument, MessageType, SenderRole } from '../../schema/chat-message.schema';

import { CreateRoomRequestDto } from './dto/request/create-room-request.dto';
import { SendMessageRequestDto } from './dto/request/send-message-request.dto';

@Injectable()
export class ChatService {
    constructor(
        private readonly chatRepository: ChatRepository,
        private readonly kafkaService: KafkaService,
        private readonly logger: CustomLoggerService,
    ) {}

    /**
     * 채팅방 생성 또는 기존 방 반환 (adopter만 생성 가능)
     */
    async createOrGetRoom(adopterId: string, dto: CreateRoomRequestDto): Promise<ChatRoomDocument> {
        const existing = await this.chatRepository.findRoomByParticipants(adopterId, dto.breederId);
        if (existing) {
            return existing;
        }

        const room = await this.chatRepository.createRoom(adopterId, dto.breederId, dto.applicationId);

        await this.kafkaService.emit(KafkaTopic.CHAT_ROOM_CREATED, {
            roomId: room._id.toString(),
            adopterId,
            breederId: dto.breederId,
            applicationId: dto.applicationId,
        });

        this.logger.logSuccess('ChatService', `채팅방 생성: ${room._id}`);
        return room;
    }

    /**
     * 내 채팅방 목록 조회
     */
    async getMyRooms(userId: string, role: SenderRole): Promise<ChatRoomDocument[]> {
        if (role === SenderRole.ADOPTER) {
            return this.chatRepository.findRoomsByAdopterId(userId);
        }
        return this.chatRepository.findRoomsByBreederId(userId);
    }

    /**
     * 메시지 전송 (DB 저장 + Kafka 발행)
     */
    async sendMessage(
        senderId: string,
        senderRole: SenderRole,
        dto: SendMessageRequestDto,
    ): Promise<ChatMessageDocument> {
        const room = await this.chatRepository.findRoomById(dto.roomId);
        if (!room) {
            throw new NotFoundException('채팅방을 찾을 수 없습니다.');
        }

        // 참여자 검증
        if (room.adopterId !== senderId && room.breederId !== senderId) {
            throw new ForbiddenException('채팅방 참여자가 아닙니다.');
        }

        const receiverId = senderRole === SenderRole.ADOPTER ? room.breederId : room.adopterId;
        const messageType = dto.messageType ?? MessageType.TEXT;

        const message = await this.chatRepository.createMessage({
            roomId: dto.roomId,
            senderId,
            senderRole,
            receiverId,
            content: dto.content,
            messageType,
        });

        // 채팅방 마지막 메시지 업데이트
        await this.chatRepository.updateRoomLastMessage(dto.roomId, dto.content);

        // Kafka에 메시지 발행 (이벤트 로깅 / 알림 처리)
        await this.kafkaService.emit(KafkaTopic.CHAT_MESSAGE, {
            messageId: message._id.toString(),
            roomId: dto.roomId,
            senderId,
            senderRole,
            receiverId,
            content: dto.content,
            messageType,
            timestamp: new Date(),
        });

        return message;
    }

    /**
     * 채팅 메시지 내역 조회
     */
    async getMessages(
        userId: string,
        roomId: string,
        limit: number = 50,
        before?: Date,
    ): Promise<ChatMessageDocument[]> {
        const room = await this.chatRepository.findRoomById(roomId);
        if (!room) {
            throw new NotFoundException('채팅방을 찾을 수 없습니다.');
        }
        if (room.adopterId !== userId && room.breederId !== userId) {
            throw new ForbiddenException('채팅방 참여자가 아닙니다.');
        }

        const messages = await this.chatRepository.findMessagesByRoomId(roomId, limit, before);

        // 조회 시 읽음 처리
        await this.chatRepository.markMessagesAsRead(roomId, userId);

        return messages;
    }

    /**
     * 채팅방 종료
     */
    async closeRoom(userId: string, roomId: string): Promise<void> {
        const room = await this.chatRepository.findRoomById(roomId);
        if (!room) {
            throw new NotFoundException('채팅방을 찾을 수 없습니다.');
        }
        if (room.adopterId !== userId && room.breederId !== userId) {
            throw new ForbiddenException('채팅방 참여자가 아닙니다.');
        }

        await this.chatRepository.closeRoom(roomId);

        await this.kafkaService.emit(KafkaTopic.CHAT_ROOM_CLOSED, {
            roomId,
            closedBy: userId,
            timestamp: new Date(),
        });
    }
}
