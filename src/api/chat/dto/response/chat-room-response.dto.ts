import { ApiProperty } from '@nestjs/swagger';
import { ChatRoomStatus } from '../../../../schema/chat-room.schema';
import { SenderRole } from '../../../../schema/chat-message.schema';

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
