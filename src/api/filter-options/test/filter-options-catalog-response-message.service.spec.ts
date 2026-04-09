import { FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES } from '../constants/filter-options-response-messages';
import { FilterOptionsCatalogResponseMessageService } from '../domain/services/filter-options-catalog-response-message.service';

describe('필터 옵션 목록 응답 메시지 서비스', () => {
    const service = new FilterOptionsCatalogResponseMessageService();

    it('개별 옵션 조회 메시지 계약을 유지한다', () => {
        expect(service.breederLevelsRetrieved()).toBe(
            FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.breederLevelsRetrieved,
        );
        expect(service.sortOptionsRetrieved()).toBe(FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.sortOptionsRetrieved);
        expect(service.dogSizesRetrieved()).toBe(FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.dogSizesRetrieved);
        expect(service.catFurLengthsRetrieved()).toBe(FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.catFurLengthsRetrieved);
        expect(service.adoptionStatusRetrieved()).toBe(
            FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.adoptionStatusRetrieved,
        );
    });
});
