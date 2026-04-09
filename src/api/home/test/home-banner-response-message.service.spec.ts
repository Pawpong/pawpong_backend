import { HOME_RESPONSE_MESSAGE_EXAMPLES } from '../constants/home-response-messages';
import { HomeBannerResponseMessageService } from '../domain/services/home-banner-response-message.service';

describe('홈 배너 응답 메시지 서비스', () => {
    const service = new HomeBannerResponseMessageService();

    it('배너 조회와 관리자 변경 메시지 계약을 유지한다', () => {
        expect(service.bannersRetrieved()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.bannersRetrieved);
        expect(service.bannerCreated()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.bannerCreated);
        expect(service.bannerUpdated()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.bannerUpdated);
        expect(service.bannerDeleted()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.bannerDeleted);
    });
});
