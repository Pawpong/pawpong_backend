import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guard/roles.guard';
import { Roles } from '../../../../common/decorator/roles.decorator';
import { CurrentUser } from '../../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';

import { GetMyRoomsUseCase } from '../application/use-cases/get-my-rooms.use-case';
import { GetMessagesUseCase } from '../application/use-cases/get-messages.use-case';
import { CHAT_RESPONSE_MESSAGES } from '../constants/chat-response-messages';
import { SenderRole } from '../../../../schema/chat-message.schema';
import { ApiGetMyRoomsEndpoint, ApiGetMessagesEndpoint } from '../swagger/index';

@ApiTags('채팅')
@Controller('v2/chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatRoomQueryController {
    constructor(
        private readonly getMyRoomsUseCase: GetMyRoomsUseCase,
        private readonly getMessagesUseCase: GetMessagesUseCase,
    ) {}

    @Get('rooms')
    @Roles('adopter', 'breeder')
    @ApiGetMyRoomsEndpoint()
    async getMyRooms(@CurrentUser() user: { userId: string; role: string }): Promise<ApiResponseDto<unknown>> {
        const role = user.role === 'adopter' ? SenderRole.ADOPTER : SenderRole.BREEDER;
        const rooms = await this.getMyRoomsUseCase.execute(user.userId, role);
        return ApiResponseDto.success(rooms, CHAT_RESPONSE_MESSAGES.roomsRetrieved);
    }

    @Get('rooms/:roomId/messages')
    @Roles('adopter', 'breeder')
    @ApiGetMessagesEndpoint()
    async getMessages(
        @CurrentUser() user: { userId: string },
        @Param('roomId') roomId: string,
        @Query('limit') limit: number = 50,
        @Query('before') before?: string,
    ): Promise<ApiResponseDto<unknown>> {
        const beforeDate = before ? new Date(before) : undefined;
        const messages = await this.getMessagesUseCase.execute(user.userId, { roomId, limit, before: beforeDate });
        const items = messages.map((message) => ({
            messageId: message.id,
            roomId: message.roomId,
            senderRole: message.senderRole,
            isMine: message.senderId === user.userId,
            content: message.content,
            messageType: message.messageType,
            isRead: message.isRead,
            createdAt: message.createdAt.toISOString(),
        }));
        return ApiResponseDto.success(items, CHAT_RESPONSE_MESSAGES.messagesRetrieved);
    }
}
