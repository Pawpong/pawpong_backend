import { HOME_RESPONSE_MESSAGE_EXAMPLES } from '../constants/home-response-messages';
import { HomeAvailablePetResponseMessageService } from '../domain/services/home-available-pet-response-message.service';

describe('홈 분양 개체 응답 메시지 서비스', () => {
    const service = new HomeAvailablePetResponseMessageService();

    it('분양 개체 조회 메시지 계약을 유지한다', () => {
        expect(service.availablePetsRetrieved()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.availablePetsRetrieved);
    });
});
