import { Inject, Injectable } from '@nestjs/common';
import { CHAT_ROOM_MANAGER, type ChatRoomManagerPort } from '../ports/chat-room-manager.port';
import {
    CHAT_APPLICATION_LIST_READER,
    type ChatApplicationListReaderPort,
} from '../ports/chat-application-reader.port';
import { ChatPolicyService } from '../../domain/services/chat-policy.service';

@Injectable()
export class GetChatApplicationsUseCase {
    constructor(
        @Inject(CHAT_ROOM_MANAGER) private readonly rooms: ChatRoomManagerPort,
        @Inject(CHAT_APPLICATION_LIST_READER) private readonly applications: ChatApplicationListReaderPort,
        private readonly policy: ChatPolicyService,
    ) {}

    /** 방 참여 권한과 신청서 당사자 권한을 모두 확인한다. */
    async execute(userId: string, roomId: string) {
        const room = this.policy.requireRoom(await this.rooms.findRoomById(roomId));
        this.policy.requireParticipant(room, userId);
        const ids = [...room.applicationIds, ...(room.applicationId ? [room.applicationId] : [])];
        return this.applications.readLinked(
            ids,
            room.participants.map((p) => p.userId),
            userId,
        );
    }
}
