import { HOME_RESPONSE_MESSAGE_EXAMPLES } from '../constants/home-response-messages';
import { HomeBannerCommandResponseMessageService } from '../domain/services/home-banner-command-response-message.service';

describe('홈 배너 명령 응답 메시지 서비스', () => {
    const service = new HomeBannerCommandResponseMessageService();

    it('배너 생성, 수정, 삭제 메시지 계약을 유지한다', () => {
        expect(service.bannerCreated()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.bannerCreated);
        expect(service.bannerUpdated()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.bannerUpdated);
        expect(service.bannerDeleted()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.bannerDeleted);
    });
});
