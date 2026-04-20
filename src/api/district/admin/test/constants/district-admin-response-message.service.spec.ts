import { DISTRICT_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/district-admin-response-messages';

describe('지역 관리자 응답 메시지 상수', () => {
    it('삭제 메시지 계약을 유지한다', () => {
        expect(DISTRICT_ADMIN_RESPONSE_MESSAGE_EXAMPLES.districtDeleted).toBe('지역이 삭제되었습니다.');
    });
});
