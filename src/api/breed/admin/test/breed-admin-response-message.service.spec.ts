import { BREED_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../constants/breed-admin-response-messages';
import { BreedAdminResponseMessageService } from '../domain/services/breed-admin-response-message.service';

describe('품종 관리자 응답 메시지 서비스', () => {
    const service = new BreedAdminResponseMessageService();

    it('삭제 메시지 계약을 유지한다', () => {
        expect(service.breedDeleted()).toBe(BREED_ADMIN_RESPONSE_MESSAGE_EXAMPLES.breedDeleted);
    });
});
