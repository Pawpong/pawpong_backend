import { FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES } from '../constants/filter-options-response-messages';
import { FilterOptionsResponseMessageService } from '../domain/services/filter-options-response-message.service';

describe('필터 옵션 응답 메시지 서비스', () => {
    const service = new FilterOptionsResponseMessageService();

    it('조회 응답 메시지 계약을 유지한다', () => {
        expect(service.allFilterOptionsRetrieved()).toBe(
            FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.allFilterOptionsRetrieved,
        );
        expect(service.breederLevelsRetrieved()).toBe(
            FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.breederLevelsRetrieved,
        );
        expect(service.sortOptionsRetrieved()).toBe(FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.sortOptionsRetrieved);
        expect(service.dogSizesRetrieved()).toBe(FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.dogSizesRetrieved);
        expect(service.catFurLengthsRetrieved()).toBe(
            FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.catFurLengthsRetrieved,
        );
        expect(service.adoptionStatusRetrieved()).toBe(
            FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.adoptionStatusRetrieved,
        );
    });
});
