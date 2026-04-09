import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiController, ApiEndpoint } from '../../common/decorator/swagger.decorator';

import { ChatService } from './chat.service';
import { CreateRoomRequestDto } from './dto/request/create-room-request.dto';
import { SenderRole } from '../../schema/chat-message.schema';

@ApiController('채팅')
@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    /**
     * 채팅방 생성 또는 기존 방 반환 (adopter 전용)
     */
    @Post('rooms')
    @Roles('adopter')
    @ApiEndpoint({ summary: '채팅방 생성 또는 조회', description: '동일 adopter-breeder 쌍이면 기존 방을 반환합니다.' })
    async createOrGetRoom(
        @CurrentUser() user: { userId: string },
        @Body() dto: CreateRoomRequestDto,
    ) {
        const room = await this.chatService.createOrGetRoom(user.userId, dto);
        return { roomId: room._id.toString(), ...room };
    }

    /**
     * 내 채팅방 목록 조회
     */
    @Get('rooms')
    @Roles('adopter', 'breeder')
    @ApiEndpoint({ summary: '내 채팅방 목록 조회' })
    async getMyRooms(@CurrentUser() user: { userId: string; role: string }) {
        const role = user.role === 'adopter' ? SenderRole.ADOPTER : SenderRole.BREEDER;
        return this.chatService.getMyRooms(user.userId, role);
    }

    /**
     * 채팅 메시지 내역 조회 (REST fallback — 실시간은 WebSocket)
     */
    @Get('rooms/:roomId/messages')
    @Roles('adopter', 'breeder')
    @ApiEndpoint({ summary: '채팅 메시지 내역 조회', description: '최신 메시지부터 limit개 반환. before 파라미터로 페이지네이션.' })
    async getMessages(
        @CurrentUser() user: { userId: string },
        @Param('roomId') roomId: string,
        @Query('limit') limit: number = 50,
        @Query('before') before?: string,
    ) {
        const beforeDate = before ? new Date(before) : undefined;
        return this.chatService.getMessages(user.userId, roomId, limit, beforeDate);
    }

    /**
     * 채팅방 종료
     */
    @Delete('rooms/:roomId')
    @Roles('adopter', 'breeder')
    @ApiEndpoint({ summary: '채팅방 종료' })
    async closeRoom(
        @CurrentUser() user: { userId: string },
        @Param('roomId') roomId: string,
    ) {
        await this.chatService.closeRoom(user.userId, roomId);
        return { success: true };
    }
}
