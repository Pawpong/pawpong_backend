import { FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES } from '../constants/filter-options-response-messages';
import { FilterOptionsSummaryResponseMessageService } from '../domain/services/filter-options-summary-response-message.service';

describe('필터 옵션 요약 응답 메시지 서비스', () => {
    const service = new FilterOptionsSummaryResponseMessageService();

    it('전체 필터 옵션 조회 메시지 계약을 유지한다', () => {
        expect(service.allFilterOptionsRetrieved()).toBe(
            FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.allFilterOptionsRetrieved,
        );
    });
});
