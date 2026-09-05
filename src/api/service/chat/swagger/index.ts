import { applyDecorators } from '@nestjs/common';

import { ApiEndpoint } from '../../../../common/decorator/swagger.decorator';
import { CHAT_RESPONSE_MESSAGES } from '../constants/chat-response-messages';
import { ChatRoomResponseDto } from '../dto/response/chat-room-response.dto';
import { ChatMessageResponseDto } from '../dto/response/chat-message-response.dto';

export function ApiCreateOrGetRoomEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '채팅방 생성 또는 조회',
            description:
                '역할과 무관한 1:1 DM입니다. 동일한 두 사용자면 숨기거나 종료했던 방도 기존 roomId로 다시 활성화합니다.',
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
            summary: '내 채팅방 목록에서 숨기기',
            description:
                '요청자 목록에서만 숨깁니다. 상대방 방과 메시지는 유지되며 다시 대화하면 같은 방이 표시됩니다.',
            // 응답 data 는 null — 실제 응답과 문서를 일치시킨다
            nullableData: true,
            successDescription: '채팅방 종료 성공',
            successMessageExample: CHAT_RESPONSE_MESSAGES.roomClosed,
        }),
    );
}

export function ApiBlockChatUserEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '채팅 사용자 차단',
            description: '기존 대화 기록은 유지하고 두 사용자 사이의 새 대화·메시지 송신을 양방향으로 막습니다.',
            nullableData: true,
            successDescription: '사용자 차단 성공',
            successMessageExample: CHAT_RESPONSE_MESSAGES.userBlocked,
        }),
    );
}

export function ApiUnblockChatUserEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '채팅 사용자 차단 해제',
            nullableData: true,
            successDescription: '사용자 차단 해제 성공',
            successMessageExample: CHAT_RESPONSE_MESSAGES.userUnblocked,
        }),
    );
}
