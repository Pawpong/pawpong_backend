import { Inject, Injectable } from '@nestjs/common';

import { CHAT_ROOM_MANAGER, type ChatRoomManagerPort, type ChatRoomSnapshot } from '../ports/chat-room-manager.port';
import { CHAT_MESSAGE_BROKER, type ChatMessageBrokerPort } from '../ports/chat-message-broker.port';
import { CHAT_PARTICIPANT_READER, type ChatParticipantReaderPort } from '../ports/chat-participant-reader.port';
import { ChatPolicyService } from '../../domain/services/chat-policy.service';
import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { SenderRole } from '../../../../../schema/chat-message.schema';
import { DomainValidationError } from '../../../../../common/error/domain.error';
import type { CreateRoomCommand } from '../types/chat-command.type';
import { CHAT_USER_BLOCK_MANAGER, type ChatUserBlockManagerPort } from '../ports/chat-user-block-manager.port';

@Injectable()
export class CreateOrGetRoomUseCase {
    constructor(
        @Inject(CHAT_ROOM_MANAGER)
        private readonly chatRoomManager: ChatRoomManagerPort,
        @Inject(CHAT_MESSAGE_BROKER)
        private readonly chatMessageBroker: ChatMessageBrokerPort,
        @Inject(CHAT_PARTICIPANT_READER)
        private readonly participantReader: ChatParticipantReaderPort,
        @Inject(CHAT_USER_BLOCK_MANAGER)
        private readonly blockManager: ChatUserBlockManagerPort,
        private readonly chatPolicyService: ChatPolicyService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(userId: string, role: SenderRole, command: CreateRoomCommand): Promise<ChatRoomSnapshot> {
        const counterpartUserId = command.counterpartUserId ?? command.breederId;
        if (!counterpartUserId) throw new DomainValidationError('counterpartUserId가 필요합니다.');

        this.logger.logStart('createOrGetRoom', '채팅방 생성/조회 시작', { userId, counterpartUserId });

        try {
            this.chatPolicyService.requireDifferentUsers(userId, counterpartUserId);
            const [requester, counterpart, isBlocked] = await Promise.all([
                this.participantReader.findParticipant(userId, role),
                this.participantReader.findParticipant(counterpartUserId),
                this.blockManager.isBlockedBetween(userId, counterpartUserId),
            ]);
            const validRequester = this.chatPolicyService.requireProfile(requester, '요청 사용자를 찾을 수 없습니다.');
            const validCounterpart = this.chatPolicyService.requireProfile(counterpart);
            this.chatPolicyService.requireRole(validRequester, role);
            this.chatPolicyService.requireActive(validRequester);
            this.chatPolicyService.requireActive(validCounterpart);
            this.chatPolicyService.requireNotBlocked(isBlocked);

            const participantIds = [userId, counterpartUserId];
            const existing = await this.chatRoomManager.findRoomByParticipants(participantIds);
            if (existing) {
                const room = await this.chatRoomManager.activateRoom(existing.id, command.applicationId);
                this.logger.logSuccess('createOrGetRoom', '기존 채팅방 재활성화', { roomId: room.id });
                return room;
            }

            let room: ChatRoomSnapshot;
            try {
                room = await this.chatRoomManager.createRoom(
                    [
                        { userId, role: validRequester.role },
                        { userId: counterpartUserId, role: validCounterpart.role },
                    ],
                    command.applicationId,
                );
            } catch (error) {
                if (!this.isDuplicateKeyError(error)) throw error;
                const concurrentlyCreated = await this.chatRoomManager.findRoomByParticipants(participantIds);
                room = await this.chatRoomManager.activateRoom(
                    this.chatPolicyService.requireRoom(concurrentlyCreated).id,
                    command.applicationId,
                );
                return room;
            }

            const adopterId = room.participants.find(
                ({ role: participantRole }) => participantRole === SenderRole.ADOPTER,
            )?.userId;
            const breederId = room.participants.find(
                ({ role: participantRole }) => participantRole === SenderRole.BREEDER,
            )?.userId;
            await this.chatMessageBroker.publishRoomCreated({
                roomId: room.id,
                participantIds: room.participantIds,
                participants: room.participants,
                applicationIds: room.applicationIds,
                adopterId,
                breederId,
                applicationId: command.applicationId,
            });

            this.logger.logSuccess('createOrGetRoom', '채팅방 신규 생성', { roomId: room.id });
            return room;
        } catch (error) {
            this.logger.logError('createOrGetRoom', '채팅방 생성/조회', error);
            throw error;
        }
    }

    private isDuplicateKeyError(error: unknown): boolean {
        return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
    }
}
