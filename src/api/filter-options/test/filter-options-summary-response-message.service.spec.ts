import { FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES } from '../constants/filter-options-response-messages';

describe('필터 옵션 요약 응답 메시지 상수', () => {
    it('전체 필터 옵션 조회 메시지 계약을 유지한다', () => {
        expect(FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.allFilterOptionsRetrieved).toBe('필터 옵션이 조회되었습니다.');
    });
});
