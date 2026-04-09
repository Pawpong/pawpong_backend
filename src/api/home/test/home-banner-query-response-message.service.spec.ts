import { HOME_RESPONSE_MESSAGE_EXAMPLES } from '../constants/home-response-messages';
import { HomeBannerQueryResponseMessageService } from '../domain/services/home-banner-query-response-message.service';

describe('홈 배너 조회 응답 메시지 서비스', () => {
    const service = new HomeBannerQueryResponseMessageService();

    it('배너 조회 메시지 계약을 유지한다', () => {
        expect(service.bannersRetrieved()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.bannersRetrieved);
    });
});
