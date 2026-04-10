import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../constants/breeder-management-response-messages';

describe('브리더 관리 응답 메시지 서비스', () => {
    it('공개 경로와 관리자 경로가 공유하는 메시지 계약을 유지한다', () => {
        expect(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.dashboardRetrieved).toBe('대시보드 정보가 조회되었습니다.');
        expect(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.verificationDocumentsUploaded).toBe(
            '브리더 인증 서류가 업로드되었습니다.',
        );
        expect(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.profileBannerCreated).toBe('프로필 배너가 생성되었습니다.');
        expect(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.counselBannerDeleted).toBe('상담 배너가 삭제되었습니다.');
    });

    it('컨트롤러용 메시지와 유스케이스 상세 메시지를 구분해서 유지한다', () => {
        expect(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.verificationSubmitted).toBe(
            '인증 신청이 성공적으로 제출되었습니다.',
        );
        expect(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.verificationSubmittedDetailed).toBe(
            '브리더 인증 신청이 성공적으로 제출되었습니다. 관리자 검토 후 결과를 알려드립니다.',
        );
        expect(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationFormUpdated).toBe('입양 신청 폼이 업데이트되었습니다.');
        expect(BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationFormUpdatedDetailed).toBe(
            '입양 신청 폼이 성공적으로 업데이트되었습니다.',
        );
    });
});
