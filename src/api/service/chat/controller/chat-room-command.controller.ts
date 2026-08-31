import { Controller, Post, Delete, Body, Param, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guard/roles.guard';
import { Roles } from '../../../../common/decorator/roles.decorator';
import { CurrentUser } from '../../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';

import { CreateOrGetRoomUseCase } from '../application/use-cases/create-or-get-room.use-case';
import { CloseRoomUseCase } from '../application/use-cases/close-room.use-case';
import { ChatPolicyService } from '../domain/services/chat-policy.service';
import { ChatRoomResponseAssemblerService } from '../domain/services/chat-room-response-assembler.service';
import { CHAT_RESPONSE_MESSAGES } from '../constants/chat-response-messages';
import { CreateRoomRequestDto } from '../dto/request/create-room-request.dto';
import { ApiCreateOrGetRoomEndpoint, ApiCloseRoomEndpoint } from '../swagger/index';
import { SenderRole } from '../../../../schema/chat-message.schema';

@ApiTags('채팅')
@Controller('v2/chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatRoomCommandController {
    constructor(
        private readonly createOrGetRoomUseCase: CreateOrGetRoomUseCase,
        private readonly closeRoomUseCase: CloseRoomUseCase,
        private readonly chatPolicyService: ChatPolicyService,
        private readonly chatRoomResponseAssembler: ChatRoomResponseAssemblerService,
    ) {}

    @Post('rooms')
    @Roles('adopter')
    @HttpCode(200)
    @ApiCreateOrGetRoomEndpoint()
    async createOrGetRoom(
        @CurrentUser() user: { userId: string; role: string },
        @Body() dto: CreateRoomRequestDto,
    ): Promise<ApiResponseDto<unknown>> {
        this.chatPolicyService.ensureAdopterRole(user.role);
        const room = await this.createOrGetRoomUseCase.execute(user.userId, {
            breederId: dto.breederId,
            applicationId: dto.applicationId,
        });
        const result = await this.chatRoomResponseAssembler.toResult(room, user.userId, SenderRole.ADOPTER);
        return ApiResponseDto.success(result, CHAT_RESPONSE_MESSAGES.roomReady);
    }

    @Delete('rooms/:roomId')
    @Roles('adopter', 'breeder')
    @ApiCloseRoomEndpoint()
    async closeRoom(
        @CurrentUser() user: { userId: string },
        @Param('roomId') roomId: string,
    ): Promise<ApiResponseDto<null>> {
        await this.closeRoomUseCase.execute(user.userId, roomId);
        return ApiResponseDto.success(null, CHAT_RESPONSE_MESSAGES.roomClosed);
    }
}
