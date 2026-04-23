import { FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/filter-options-response-messages';

describe('입양 상태 응답 메시지 상수', () => {
    it('입양 상태 조회 메시지 계약을 유지한다', () => {
        expect(FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.adoptionStatusRetrieved).toBe(
            '입양 가능 여부 옵션이 조회되었습니다.',
        );
    });
});
