import { FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES } from '../constants/filter-options-response-messages';
import { FilterOptionsDogSizeResponseMessageService } from '../domain/services/filter-options-dog-size-response-message.service';

describe('강아지 크기 응답 메시지 서비스', () => {
    const service = new FilterOptionsDogSizeResponseMessageService();

    it('강아지 크기 조회 메시지 계약을 유지한다', () => {
        expect(service.dogSizesRetrieved()).toBe(FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.dogSizesRetrieved);
    });
});
