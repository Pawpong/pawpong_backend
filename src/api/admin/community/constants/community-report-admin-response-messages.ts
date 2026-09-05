/**
 * 커뮤니티 신고 관리 응답 메시지.
 * 컨트롤러와 Swagger 예시가 같은 문구를 보도록 한곳에서 관리합니다.
 */
export const COMMUNITY_REPORT_ADMIN_RESPONSE_MESSAGES = {
    reportsRetrieved: '커뮤니티 신고 목록 조회 성공',
    reportResolved: '신고가 처리되었습니다.',
    reportDismissed: '신고가 기각되었습니다.',
    reportNotFound: '해당 신고를 찾을 수 없습니다.',
    reportAlreadyHandled: '이미 처리된 신고입니다.',
} as const;
