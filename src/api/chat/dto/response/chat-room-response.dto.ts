import { ApiProperty } from '@nestjs/swagger';
import { ChatRoomStatus } from '../../../../schema/chat-room.schema';

export class ChatRoomResponseDto {
    @ApiProperty()
    roomId: string;

    @ApiProperty()
    adopterId: string;

    @ApiProperty()
    breederId: string;

    @ApiProperty({ required: false })
    applicationId?: string;

    @ApiProperty({ enum: ChatRoomStatus })
    status: ChatRoomStatus;

    @ApiProperty({ required: false })
    lastMessage?: string;

    @ApiProperty({ required: false })
    lastMessageAt?: Date;

    @ApiProperty()
    createdAt: Date;
}
