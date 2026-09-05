import { Controller, Post, Delete, Body, Param, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guard/roles.guard';
import { Roles } from '../../../../common/decorator/roles.decorator';
import { CurrentUser } from '../../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';

import { CreateOrGetRoomUseCase } from '../application/use-cases/create-or-get-room.use-case';
import { CloseRoomUseCase } from '../application/use-cases/close-room.use-case';
import { BlockChatUserUseCase } from '../application/use-cases/block-chat-user.use-case';
import { UnblockChatUserUseCase } from '../application/use-cases/unblock-chat-user.use-case';
import { ChatRoomResponseAssemblerService } from '../domain/services/chat-room-response-assembler.service';
import { CHAT_RESPONSE_MESSAGES } from '../constants/chat-response-messages';
import { CreateRoomRequestDto } from '../dto/request/create-room-request.dto';
import {
    ApiBlockChatUserEndpoint,
    ApiCloseRoomEndpoint,
    ApiCreateOrGetRoomEndpoint,
    ApiUnblockChatUserEndpoint,
} from '../swagger/index';
import { SenderRole } from '../../../../schema/chat-message.schema';

@ApiTags('채팅')
@Controller('v2/chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatRoomCommandController {
    constructor(
        private readonly createOrGetRoomUseCase: CreateOrGetRoomUseCase,
        private readonly closeRoomUseCase: CloseRoomUseCase,
        private readonly blockChatUserUseCase: BlockChatUserUseCase,
        private readonly unblockChatUserUseCase: UnblockChatUserUseCase,
        private readonly chatRoomResponseAssembler: ChatRoomResponseAssemblerService,
    ) {}

    @Post('rooms')
    @Roles('adopter', 'breeder')
    @HttpCode(200)
    @ApiCreateOrGetRoomEndpoint()
    async createOrGetRoom(
        @CurrentUser() user: { userId: string; role: string },
        @Body() dto: CreateRoomRequestDto,
    ): Promise<ApiResponseDto<unknown>> {
        const role = user.role === 'adopter' ? SenderRole.ADOPTER : SenderRole.BREEDER;
        const room = await this.createOrGetRoomUseCase.execute(user.userId, role, {
            counterpartUserId: dto.counterpartUserId,
            breederId: dto.breederId,
            applicationId: dto.applicationId,
        });
        const result = await this.chatRoomResponseAssembler.toResult(room, user.userId);
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

    @Post('blocks/:userId')
    @Roles('adopter', 'breeder')
    @HttpCode(200)
    @ApiBlockChatUserEndpoint()
    async blockUser(
        @CurrentUser() user: { userId: string },
        @Param('userId') blockedUserId: string,
    ): Promise<ApiResponseDto<null>> {
        await this.blockChatUserUseCase.execute(user.userId, blockedUserId);
        return ApiResponseDto.success(null, CHAT_RESPONSE_MESSAGES.userBlocked);
    }

    @Delete('blocks/:userId')
    @Roles('adopter', 'breeder')
    @ApiUnblockChatUserEndpoint()
    async unblockUser(
        @CurrentUser() user: { userId: string },
        @Param('userId') blockedUserId: string,
    ): Promise<ApiResponseDto<null>> {
        await this.unblockChatUserUseCase.execute(user.userId, blockedUserId);
        return ApiResponseDto.success(null, CHAT_RESPONSE_MESSAGES.userUnblocked);
    }
}
