import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { CurrentUser } from '../../common/decorator/user.decorator';

import { GetMyRoomsUseCase } from './application/use-cases/get-my-rooms.use-case';
import { GetMessagesUseCase } from './application/use-cases/get-messages.use-case';
import { SenderRole } from '../../schema/chat-message.schema';
import { ApiGetMyRoomsEndpoint, ApiGetMessagesEndpoint } from './swagger';

@ApiTags('채팅')
@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatRoomQueryController {
    constructor(
        private readonly getMyRoomsUseCase: GetMyRoomsUseCase,
        private readonly getMessagesUseCase: GetMessagesUseCase,
    ) {}

    @Get('rooms')
    @Roles('adopter', 'breeder')
    @ApiGetMyRoomsEndpoint()
    async getMyRooms(@CurrentUser() user: { userId: string; role: string }) {
        const role = user.role === 'adopter' ? SenderRole.ADOPTER : SenderRole.BREEDER;
        return this.getMyRoomsUseCase.execute(user.userId, role);
    }

    @Get('rooms/:roomId/messages')
    @Roles('adopter', 'breeder')
    @ApiGetMessagesEndpoint()
    async getMessages(
        @CurrentUser() user: { userId: string },
        @Param('roomId') roomId: string,
        @Query('limit') limit: number = 50,
        @Query('before') before?: string,
    ) {
        const beforeDate = before ? new Date(before) : undefined;
        return this.getMessagesUseCase.execute(user.userId, roomId, limit, beforeDate);
    }
}
