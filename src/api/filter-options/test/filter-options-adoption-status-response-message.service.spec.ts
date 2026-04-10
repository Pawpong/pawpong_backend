import { FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES } from '../constants/filter-options-response-messages';
import { FilterOptionsAdoptionStatusResponseMessageService } from '../domain/services/filter-options-adoption-status-response-message.service';

describe('입양 상태 응답 메시지 서비스', () => {
    const service = new FilterOptionsAdoptionStatusResponseMessageService();

    it('입양 상태 조회 메시지 계약을 유지한다', () => {
        expect(service.adoptionStatusRetrieved()).toBe(
            FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.adoptionStatusRetrieved,
        );
    });
});
