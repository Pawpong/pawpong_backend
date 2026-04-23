import { Controller, Post, Delete, Body, Param, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { CurrentUser } from '../../common/decorator/user.decorator';

import { CreateOrGetRoomUseCase } from './application/use-cases/create-or-get-room.use-case';
import { CloseRoomUseCase } from './application/use-cases/close-room.use-case';
import { ChatPolicyService } from './domain/services/chat-policy.service';
import { CreateRoomRequestDto } from './dto/request/create-room-request.dto';
import { ApiCreateOrGetRoomEndpoint, ApiCloseRoomEndpoint } from './swagger';

@ApiTags('채팅')
@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatRoomCommandController {
    constructor(
        private readonly createOrGetRoomUseCase: CreateOrGetRoomUseCase,
        private readonly closeRoomUseCase: CloseRoomUseCase,
        private readonly chatPolicyService: ChatPolicyService,
    ) {}

    @Post('rooms')
    @Roles('adopter')
    @HttpCode(200)
    @ApiCreateOrGetRoomEndpoint()
    async createOrGetRoom(@CurrentUser() user: { userId: string; role: string }, @Body() dto: CreateRoomRequestDto) {
        this.chatPolicyService.ensureAdopterRole(user.role);
        const room = await this.createOrGetRoomUseCase.execute(user.userId, {
            breederId: dto.breederId,
            applicationId: dto.applicationId,
        });
        return room;
    }

    @Delete('rooms/:roomId')
    @Roles('adopter', 'breeder')
    @ApiCloseRoomEndpoint()
    async closeRoom(@CurrentUser() user: { userId: string }, @Param('roomId') roomId: string) {
        await this.closeRoomUseCase.execute(user.userId, roomId);
        return { success: true };
    }
}
