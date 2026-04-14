import { FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/filter-options-response-messages';

describe('강아지 크기 응답 메시지 상수', () => {
    it('강아지 크기 조회 메시지 계약을 유지한다', () => {
        expect(FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.dogSizesRetrieved).toBe('강아지 크기 옵션이 조회되었습니다.');
    });
});
