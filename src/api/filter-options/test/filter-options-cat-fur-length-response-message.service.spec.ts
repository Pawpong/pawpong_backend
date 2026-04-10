import { FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES } from '../constants/filter-options-response-messages';

describe('고양이 털 길이 응답 메시지 상수', () => {
    it('고양이 털 길이 조회 메시지 계약을 유지한다', () => {
        expect(FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.catFurLengthsRetrieved).toBe('고양이 털 길이 옵션이 조회되었습니다.');
    });
});
