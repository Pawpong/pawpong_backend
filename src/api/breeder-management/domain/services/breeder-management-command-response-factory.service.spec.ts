import { BreederManagementCommandResponseFactoryService } from './breeder-management-command-response-factory.service';

describe('BreederManagementCommandResponseFactoryService', () => {
    const service = new BreederManagementCommandResponseFactoryService();

    it('message-only 응답을 일관된 형태로 만든다', () => {
        expect(service.createProfileUpdated()).toEqual({
            message: '프로필이 성공적으로 수정되었습니다.',
        });

        expect(service.createApplicationStatusUpdated()).toEqual({
            message: '입양 신청 상태가 성공적으로 업데이트되었습니다.',
        });
    });

    it('pet 생성 응답에 petId와 message를 함께 담는다', () => {
        expect(service.createParentPetAdded('parent-pet-id')).toEqual({
            petId: 'parent-pet-id',
            message: '부모견/부모묘가 성공적으로 등록되었습니다.',
        });

        expect(service.createAvailablePetAdded('available-pet-id')).toEqual({
            petId: 'available-pet-id',
            message: '분양 가능한 반려동물이 성공적으로 등록되었습니다.',
        });
    });

    it('신청 폼 응답의 추가 필드를 유지한다', () => {
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
            message: '입양 신청 폼이 성공적으로 업데이트되었습니다.',
            customQuestions,
        });

        expect(service.createSimpleApplicationFormUpdated(customQuestions)).toEqual({
            message: '입양 신청 폼이 성공적으로 업데이트되었습니다.',
            customQuestions,
            totalQuestions: 1,
        });
    });
});
