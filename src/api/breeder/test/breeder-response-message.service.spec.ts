import {
    BREEDER_RESPONSE_MESSAGES,
    buildBreederDocumentReminderMessage,
    buildBreederTestAccountMessage,
} from '../constants/breeder-response-messages';

describe('브리더 응답 메시지 상수', () => {
    it('공개 조회와 관리자 응답 메시지 계약을 유지한다', () => {
        expect(BREEDER_RESPONSE_MESSAGES.searchCompleted).toBe('브리더 검색이 완료되었습니다.');
        expect(BREEDER_RESPONSE_MESSAGES.profileRetrieved).toBe('브리더 프로필이 조회되었습니다.');
        expect(BREEDER_RESPONSE_MESSAGES.accountSuspended).toBe('브리더 계정이 영구정지 처리되었습니다.');
        expect(BREEDER_RESPONSE_MESSAGES.verificationUpdated).toBe('브리더 인증 처리가 완료되었습니다.');
        expect(BREEDER_RESPONSE_MESSAGES.breederReportListRetrieved).toBe('브리더 신고 목록이 조회되었습니다.');
    });

    it('동적 메시지 빌더 계약을 유지한다', () => {
        expect(buildBreederTestAccountMessage(true)).toBe('테스트 계정으로 설정되었습니다.');
        expect(buildBreederTestAccountMessage(false)).toBe('테스트 계정이 해제되었습니다.');
        expect(buildBreederDocumentReminderMessage(3)).toBe('3명의 브리더에게 서류 독촉 이메일이 발송되었습니다.');
    });
});
