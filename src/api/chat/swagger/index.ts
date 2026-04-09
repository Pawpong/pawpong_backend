import { applyDecorators } from '@nestjs/common';

import { ApiEndpoint } from '../../../common/decorator/swagger.decorator';
import { ChatRoomResponseDto } from '../dto/response/chat-room-response.dto';
import { ChatMessageResponseDto } from '../dto/response/chat-message-response.dto';

export function ApiCreateOrGetRoomEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '채팅방 생성 또는 조회',
            description: '동일 adopter-breeder 쌍이면 기존 방을 반환합니다.',
            responseType: ChatRoomResponseDto,
        }),
    );
}

export function ApiGetMyRoomsEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '내 채팅방 목록 조회',
            responseType: [ChatRoomResponseDto],
        }),
    );
}

export function ApiGetMessagesEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '채팅 메시지 내역 조회',
            description: '최신 메시지부터 limit개 반환. before 파라미터로 페이지네이션.',
            responseType: [ChatMessageResponseDto],
        }),
    );
}

export function ApiCloseRoomEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '채팅방 종료',
        }),
    );
}
