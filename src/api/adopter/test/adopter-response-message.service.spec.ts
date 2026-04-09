import { ADOPTER_RESPONSE_MESSAGES } from '../domain/services/adopter-response-message.service';

describe('ADOPTER_RESPONSE_MESSAGES', () => {
    it('입양자 public/admin 응답 메시지 계약을 유지한다', () => {
        expect(ADOPTER_RESPONSE_MESSAGES.profileRetrieved).toBe('입양자 프로필이 조회되었습니다.');
        expect(ADOPTER_RESPONSE_MESSAGES.applicationCreated).toBe('입양 신청이 성공적으로 제출되었습니다.');
        expect(ADOPTER_RESPONSE_MESSAGES.favoriteListRetrieved).toBe('즐겨찾기 목록이 조회되었습니다.');
        expect(ADOPTER_RESPONSE_MESSAGES.adminReviewDeleted).toBe('부적절한 후기가 삭제되었습니다.');
        expect(ADOPTER_RESPONSE_MESSAGES.adminApplicationDetailRetrieved).toBe('입양 신청 상세 정보가 조회되었습니다.');
    });
});
