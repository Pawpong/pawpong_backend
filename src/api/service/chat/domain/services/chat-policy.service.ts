import { Injectable } from '@nestjs/common';

import {
    DomainAuthorizationError,
    DomainNotFoundError,
    DomainValidationError,
} from '../../../../../common/error/domain.error';
import { UserStatus } from '../../../../../common/enum/user.enum';
import { SenderRole } from '../../../../../schema/chat-message.schema';
import type { ChatParticipantProfileSnapshot } from '../../application/ports/chat-participant-reader.port';
import type { ChatRoomParticipantSnapshot, ChatRoomSnapshot } from '../../application/ports/chat-room-manager.port';

@Injectable()
export class ChatPolicyService {
    requireRoom(room: ChatRoomSnapshot | null): ChatRoomSnapshot {
        if (!room) throw new DomainNotFoundError('채팅방을 찾을 수 없습니다.');
        return room;
    }

    requireParticipant(room: ChatRoomSnapshot, userId: string): ChatRoomParticipantSnapshot {
        const participant = room.participants.find((item) => item.userId === userId);
        if (!participant) throw new DomainAuthorizationError('채팅방 참여자가 아닙니다.');
        return participant;
    }

    resolveReceiver(room: ChatRoomSnapshot, senderId: string): ChatRoomParticipantSnapshot {
        this.requireParticipant(room, senderId);
        const receiver = room.participants.find((item) => item.userId !== senderId);
        if (!receiver) throw new DomainValidationError('1:1 채팅방의 상대 사용자를 확인할 수 없습니다.');
        return receiver;
    }

    requireProfile(
        participant: ChatParticipantProfileSnapshot | null,
        message: string = '채팅 상대 사용자를 찾을 수 없습니다.',
    ): ChatParticipantProfileSnapshot {
        if (!participant) throw new DomainNotFoundError(message);
        return participant;
    }

    requireActive(participant: ChatParticipantProfileSnapshot): void {
        if (participant.accountStatus === UserStatus.SUSPENDED) {
            throw new DomainAuthorizationError('정지된 사용자는 새 대화를 시작하거나 메시지를 보낼 수 없습니다.');
        }
        if (participant.accountStatus === UserStatus.DELETED) {
            throw new DomainAuthorizationError('탈퇴한 사용자와는 새 대화를 시작하거나 메시지를 보낼 수 없습니다.');
        }
    }

    requireNotBlocked(isBlocked: boolean): void {
        if (isBlocked) {
            throw new DomainAuthorizationError('차단 관계에서는 새 대화를 시작하거나 메시지를 보낼 수 없습니다.');
        }
    }

    requireRole(participant: ChatParticipantProfileSnapshot, role: SenderRole): void {
        if (participant.role !== role)
            throw new DomainAuthorizationError('인증 역할과 사용자 정보가 일치하지 않습니다.');
    }

    requireDifferentUsers(firstUserId: string, secondUserId: string): void {
        if (firstUserId === secondUserId) throw new DomainValidationError('자기 자신과는 채팅방을 만들 수 없습니다.');
    }
}
