import { HOME_RESPONSE_MESSAGE_EXAMPLES } from '../constants/home-response-messages';
import { HomeBannerWriteResponseMessageService } from '../domain/services/home-banner-write-response-message.service';

describe('홈 배너 쓰기 응답 메시지 서비스', () => {
    const service = new HomeBannerWriteResponseMessageService();

    it('배너 생성과 수정 메시지 계약을 유지한다', () => {
        expect(service.bannerCreated()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.bannerCreated);
        expect(service.bannerUpdated()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.bannerUpdated);
    });
});
