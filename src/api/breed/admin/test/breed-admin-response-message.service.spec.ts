import { BREED_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../constants/breed-admin-response-messages';

describe('품종 관리자 응답 메시지 상수', () => {
    it('삭제 메시지 계약을 유지한다', () => {
        expect(BREED_ADMIN_RESPONSE_MESSAGE_EXAMPLES.breedDeleted).toBe('품종 카테고리가 삭제되었습니다.');
    });
});
