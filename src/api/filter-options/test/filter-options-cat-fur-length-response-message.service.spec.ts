import { FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES } from '../constants/filter-options-response-messages';
import { FilterOptionsCatFurLengthResponseMessageService } from '../domain/services/filter-options-cat-fur-length-response-message.service';

describe('고양이 털 길이 응답 메시지 서비스', () => {
    const service = new FilterOptionsCatFurLengthResponseMessageService();

    it('고양이 털 길이 조회 메시지 계약을 유지한다', () => {
        expect(service.catFurLengthsRetrieved()).toBe(
            FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.catFurLengthsRetrieved,
        );
    });
});
