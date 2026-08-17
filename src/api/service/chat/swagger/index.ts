import { applyDecorators } from '@nestjs/common';

import { ApiEndpoint } from '../../../../common/decorator/swagger.decorator';
import { CHAT_RESPONSE_MESSAGES } from '../constants/chat-response-messages';
import { ChatRoomResponseDto } from '../dto/response/chat-room-response.dto';
import { ChatMessageResponseDto } from '../dto/response/chat-message-response.dto';

export function ApiCreateOrGetRoomEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '채팅방 생성 또는 조회',
            description: '동일 adopter-breeder 쌍이면 기존 방을 반환합니다.',
            responseType: ChatRoomResponseDto,
            successDescription: '채팅방 조회 성공',
            successMessageExample: CHAT_RESPONSE_MESSAGES.roomReady,
        }),
    );
}

export function ApiGetMyRoomsEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '내 채팅방 목록 조회',
            responseType: [ChatRoomResponseDto],
            successDescription: '채팅방 목록 조회 성공',
            successMessageExample: CHAT_RESPONSE_MESSAGES.roomsRetrieved,
        }),
    );
}

export function ApiGetMessagesEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '채팅 메시지 내역 조회',
            description: '최신 메시지부터 limit개 반환. before 파라미터로 페이지네이션.',
            responseType: [ChatMessageResponseDto],
            successDescription: '메시지 목록 조회 성공',
            successMessageExample: CHAT_RESPONSE_MESSAGES.messagesRetrieved,
        }),
    );
}

export function ApiCloseRoomEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '채팅방 종료',
            description: '채팅방을 종료(CLOSED) 처리합니다. 종료 후 같은 상대와 다시 문의하면 새 방이 생성됩니다.',
            // 응답 data 는 null — 실제 응답과 문서를 일치시킨다
            nullableData: true,
            successDescription: '채팅방 종료 성공',
            successMessageExample: CHAT_RESPONSE_MESSAGES.roomClosed,
        }),
    );
}
