import { BreederManagementApplicationCommandResultMapperService } from '../domain/services/breeder-management-application-command-result-mapper.service';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../constants/breeder-management-response-messages';

describe('브리더 관리 신청서 명령 결과 매퍼', () => {
    const service = new BreederManagementApplicationCommandResultMapperService();

    it('신청서 수정 결과의 추가 필드를 유지한다', () => {
        const customQuestions = [
            {
                id: 'custom_pet_experience',
                type: 'textarea',
                label: '반려 경험이 있나요?',
                required: false,
                order: 1,
            },
        ];

        expect(service.toApplicationFormUpdatedResult(customQuestions)).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationFormUpdatedDetailed,
            customQuestions,
        });

        expect(service.toSimpleApplicationFormUpdatedResult(customQuestions)).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationFormUpdatedDetailed,
            customQuestions,
            totalQuestions: 1,
        });
    });
});
