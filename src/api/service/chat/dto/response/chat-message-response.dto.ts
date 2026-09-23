import { ApiProperty } from '@nestjs/swagger';
import { MessageType, SenderRole } from '../../../../../schema/chat-message.schema';

export class ChatMessageResponseDto {
    @ApiProperty()
    messageId: string;

    @ApiProperty({ required: false, description: '클라이언트 재전송 식별자' })
    clientMessageId?: string;

    @ApiProperty()
    roomId: string;

    @ApiProperty({ enum: SenderRole })
    senderRole: SenderRole;

    @ApiProperty()
    isMine: boolean;

    @ApiProperty()
    content: string;

    @ApiProperty({ enum: MessageType })
    messageType: MessageType;

    @ApiProperty()
    isRead: boolean;

    @ApiProperty()
    createdAt: string;
}
