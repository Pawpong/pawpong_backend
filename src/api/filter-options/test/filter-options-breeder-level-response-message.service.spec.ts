import { FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES } from '../constants/filter-options-response-messages';

describe('브리더 레벨 응답 메시지 상수', () => {
    it('브리더 레벨 조회 메시지 계약을 유지한다', () => {
        expect(FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.breederLevelsRetrieved).toBe('브리더 레벨 옵션이 조회되었습니다.');
    });
});
