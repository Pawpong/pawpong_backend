import { ApiProperty } from '@nestjs/swagger';
import { ChatRoomStatus } from '../../../../../schema/chat-room.schema';
import { SenderRole } from '../../../../../schema/chat-message.schema';

export class ChatRoomCounterpartResponseDto {
    @ApiProperty()
    userId: string;

    @ApiProperty({ enum: SenderRole })
    role: SenderRole;

    @ApiProperty()
    nickname: string;

    @ApiProperty({ required: false })
    profileImageUrl?: string;
}

export class ChatRoomResponseDto {
    @ApiProperty()
    roomId: string;

    @ApiProperty({ type: [String], description: '이 방에 연결된 입양 신청 ID 목록' })
    applicationIds: string[];

    /** @deprecated applicationIds를 사용한다. */
    @ApiProperty({ required: false })
    applicationId?: string;

    @ApiProperty({ enum: ChatRoomStatus })
    status: ChatRoomStatus;

    @ApiProperty({ type: ChatRoomCounterpartResponseDto })
    counterpart: ChatRoomCounterpartResponseDto;

    @ApiProperty({ required: false })
    lastMessage?: string;

    @ApiProperty({ required: false })
    lastMessageAt?: string;

    @ApiProperty()
    unreadCount: number;

    @ApiProperty()
    createdAt: string;
}
