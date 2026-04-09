import { DISTRICT_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../constants/district-admin-response-messages';
import { DistrictAdminResponseMessageService } from '../domain/services/district-admin-response-message.service';

describe('지역 관리자 응답 메시지 서비스', () => {
    const service = new DistrictAdminResponseMessageService();

    it('삭제 메시지 계약을 유지한다', () => {
        expect(service.districtDeleted()).toBe(DISTRICT_ADMIN_RESPONSE_MESSAGE_EXAMPLES.districtDeleted);
    });
});
