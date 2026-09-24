import { Injectable, Inject } from '@nestjs/common';
import { AccountWriteFenceService } from '../../../../../common/account-write-fence/account-write-fence.service';

import { CHAT_ROOM_MANAGER, type ChatRoomManagerPort } from '../ports/chat-room-manager.port';
import {
    CHAT_MESSAGE_MANAGER,
    type ChatMessageManagerPort,
    type ChatMessageSnapshot,
} from '../ports/chat-message-manager.port';
import { CHAT_MESSAGE_BROKER, type ChatMessageBrokerPort } from '../ports/chat-message-broker.port';
import { CHAT_PARTICIPANT_READER, type ChatParticipantReaderPort } from '../ports/chat-participant-reader.port';
import { ChatPolicyService } from '../../domain/services/chat-policy.service';
import { ChatMessageMapperService } from '../../domain/services/chat-message-mapper.service';
import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { SenderRole, MessageType } from '../../../../../schema/chat-message.schema';
import type { SendMessageCommand } from '../types/chat-command.type';
import { DomainAuthorizationError, DomainValidationError } from '../../../../../common/error/domain.error';
import { CHAT_USER_BLOCK_MANAGER, type ChatUserBlockManagerPort } from '../ports/chat-user-block-manager.port';

@Injectable()
export class SendMessageUseCase {
    constructor(
        @Inject(CHAT_ROOM_MANAGER)
        private readonly chatRoomManager: ChatRoomManagerPort,
        @Inject(CHAT_MESSAGE_MANAGER)
        private readonly chatMessageManager: ChatMessageManagerPort,
        @Inject(CHAT_MESSAGE_BROKER)
        private readonly chatMessageBroker: ChatMessageBrokerPort,
        @Inject(CHAT_PARTICIPANT_READER)
        private readonly participantReader: ChatParticipantReaderPort,
        @Inject(CHAT_USER_BLOCK_MANAGER)
        private readonly blockManager: ChatUserBlockManagerPort,
        private readonly chatPolicyService: ChatPolicyService,
        private readonly chatMessageMapperService: ChatMessageMapperService,
        private readonly logger: CustomLoggerService,
        private readonly writeFence: AccountWriteFenceService,
    ) {}

    async execute(
        senderId: string,
        senderRole: SenderRole,
        command: SendMessageCommand,
    ): Promise<ChatMessageSnapshot & { brokerPublished: boolean; isDuplicate?: boolean }> {
        this.logger.logStart('sendMessage', '채팅 메시지 전송 시작', { roomId: command.roomId, senderId });

        try {
            // WebSocket도 HTTP와 같은 식별자 제한을 적용한다.
            if (
                command.clientMessageId !== undefined &&
                (typeof command.clientMessageId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(command.clientMessageId))
            ) {
                throw new DomainValidationError('메시지 식별자가 올바르지 않습니다.');
            }
            const room = this.chatPolicyService.requireRoom(await this.chatRoomManager.findRoomById(command.roomId));
            const sender = this.chatPolicyService.requireParticipant(room, senderId);
            const receiver = this.chatPolicyService.resolveReceiver(room, senderId);
            if (sender.role !== senderRole) {
                throw new DomainAuthorizationError('인증 역할과 채팅방 참여자 역할이 일치하지 않습니다.');
            }

            const [senderProfile, receiverProfile, isBlocked] = await Promise.all([
                this.participantReader.findParticipant(senderId, sender.role),
                this.participantReader.findParticipant(receiver.userId, receiver.role),
                this.blockManager.isBlockedBetween(senderId, receiver.userId),
            ]);
            this.chatPolicyService.requireActive(
                this.chatPolicyService.requireProfile(senderProfile, '발신 사용자를 찾을 수 없습니다.'),
            );
            this.chatPolicyService.requireActive(this.chatPolicyService.requireProfile(receiverProfile));
            this.chatPolicyService.requireNotBlocked(isBlocked);
            const messageType = command.messageType ?? MessageType.TEXT;

            // 수신자 삭제도 다른 사용자의 진행 중 전송을 기다리도록 양쪽 계정에 lease를 둔다.
            return await this.writeFence.runWithLease(
                { accountId: receiver.userId, role: receiver.role, operation: 'chat:receive_message' },
                async () => {
                    const message = await this.chatMessageManager.createMessage({
                        ...(command.clientMessageId ? { clientMessageId: command.clientMessageId } : {}),
                        roomId: command.roomId,
                        senderId,
                        senderRole,
                        receiverId: receiver.userId,
                        content: command.content,
                        messageType,
                    });

                    if (message.isDuplicate) {
                        if (message.content !== command.content || message.messageType !== messageType) {
                            throw new DomainValidationError('같은 메시지 식별자로 다른 내용을 전송할 수 없습니다.');
                        }
                        // 이미 저장된 재시도는 읽지 않음 수·방 정렬·브로드캐스트를 다시 변경하지 않는다.
                        return { ...message, brokerPublished: true };
                    }

                    await this.chatRoomManager.updateRoomLastMessage(command.roomId, command.content);
                    const brokerPublished = await this.chatMessageBroker.publishMessage(
                        this.chatMessageMapperService.toBroadcastPayload(message),
                    );

                    this.logger.logSuccess('sendMessage', '채팅 메시지 전송 완료', { messageId: message.id });
                    return { ...message, brokerPublished };
                },
            );
        } catch (error) {
            this.logger.logError('sendMessage', '채팅 메시지 전송', error);
            throw error;
        }
    }
}
