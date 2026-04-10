import { FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES } from '../constants/filter-options-response-messages';
import { FilterOptionsBreederLevelResponseMessageService } from '../domain/services/filter-options-breeder-level-response-message.service';

describe('브리더 레벨 응답 메시지 서비스', () => {
    const service = new FilterOptionsBreederLevelResponseMessageService();

    it('브리더 레벨 조회 메시지 계약을 유지한다', () => {
        expect(service.breederLevelsRetrieved()).toBe(
            FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.breederLevelsRetrieved,
        );
    });
});
