import { BreederManagementApplicationCommandResponseService } from '../domain/services/breeder-management-application-command-response.service';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../domain/services/breeder-management-response-message.service';

describe('브리더 관리 신청서 명령 응답 서비스', () => {
    const service = new BreederManagementApplicationCommandResponseService();

    it('신청서 수정 응답의 추가 필드를 유지한다', () => {
        const customQuestions = [
            {
                id: 'custom_pet_experience',
                type: 'textarea',
                label: '반려 경험이 있나요?',
                required: false,
                order: 1,
            },
        ];

        expect(service.createApplicationFormUpdated(customQuestions)).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationFormUpdatedDetailed,
            customQuestions,
        });

        expect(service.createSimpleApplicationFormUpdated(customQuestions)).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationFormUpdatedDetailed,
            customQuestions,
            totalQuestions: 1,
        });
    });

    it('신청 상태 변경 응답을 만든다', () => {
        expect(service.createApplicationStatusUpdated()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationStatusUpdatedDetailed,
        });
    });
});
