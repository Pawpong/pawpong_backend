import { FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES } from '../constants/filter-options-response-messages';
import { FilterOptionsSortOptionResponseMessageService } from '../domain/services/filter-options-sort-option-response-message.service';

describe('정렬 옵션 응답 메시지 서비스', () => {
    const service = new FilterOptionsSortOptionResponseMessageService();

    it('정렬 옵션 조회 메시지 계약을 유지한다', () => {
        expect(service.sortOptionsRetrieved()).toBe(FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.sortOptionsRetrieved);
    });
});
