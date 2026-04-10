import { HOME_RESPONSE_MESSAGE_EXAMPLES } from '../constants/home-response-messages';
import { HomeBannerDeleteResponseMessageService } from '../domain/services/home-banner-delete-response-message.service';

describe('홈 배너 삭제 응답 메시지 서비스', () => {
    const service = new HomeBannerDeleteResponseMessageService();

    it('배너 삭제 메시지 계약을 유지한다', () => {
        expect(service.bannerDeleted()).toBe(HOME_RESPONSE_MESSAGE_EXAMPLES.bannerDeleted);
    });
});
