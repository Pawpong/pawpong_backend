import { DomainNotFoundError, DomainValidationError } from '../../../../../../common/error/domain.error';
import { UpdateAdopterApplicationUseCase } from '../../../application/use-cases/update-adopter-application.use-case';
import { AdopterApplicationCreateResultMapperService } from '../../../domain/services/adopter-application-create-result-mapper.service';
import { AdopterApplicationCustomAnswerBuilderService } from '../../../domain/services/adopter-application-custom-answer-builder.service';
import { AdopterApplicationStandardAnswerBuilderService } from '../../../domain/services/adopter-application-standard-answer-builder.service';

describe('입양 신청서 수정 유스케이스', () => {
    const adopterProfilePort = { findById: jest.fn() };
    const adopterBreederReaderPort = { findById: jest.fn() };
    const adopterApplicationCommandPort = {
        findByIdAndAdopter: jest.fn(),
        updateContent: jest.fn(),
    };

    const useCase = new UpdateAdopterApplicationUseCase(
        adopterProfilePort as any,
        adopterBreederReaderPort as any,
        adopterApplicationCommandPort as any,
        new AdopterApplicationCreateResultMapperService(),
        new AdopterApplicationCustomAnswerBuilderService(),
        new AdopterApplicationStandardAnswerBuilderService(),
    );

    const baseDto = {
        privacyConsent: true,
        name: '홍길동',
        email: 'hong@test.com',
        phone: '01012345678',
        selfIntroduction: '수정된 자기소개',
        familyMembers: '2명',
        allFamilyConsent: true,
        canProvideBasicCare: true,
        canAffordMedicalExpenses: true,
        customResponses: [],
    };

    const mockApplication = {
        _id: { toString: () => 'app-1' },
        breederId: { toString: () => 'breeder-1' },
        petId: undefined,
        status: 'consultation_pending',
        appliedAt: new Date('2026-04-01T00:00:00.000Z'),
    };

    const mockBreeder = {
        _id: { toString: () => 'breeder-1' },
        name: '행복브리더',
        nickname: '행복브리더',
        applicationForm: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('상담 대기 상태의 내 신청서를 정상적으로 수정한다', async () => {
        adopterApplicationCommandPort.findByIdAndAdopter.mockResolvedValue(mockApplication);
        adopterBreederReaderPort.findById.mockResolvedValue(mockBreeder);
        adopterProfilePort.findById.mockResolvedValue({ nickname: '홍길동', emailAddress: 'hong@test.com' });
        adopterApplicationCommandPort.updateContent.mockResolvedValue(mockApplication);

        const result = await useCase.execute('adopter-1', 'app-1', baseDto);

        expect(adopterApplicationCommandPort.findByIdAndAdopter).toHaveBeenCalledWith('app-1', 'adopter-1');
        expect(adopterApplicationCommandPort.updateContent).toHaveBeenCalledWith(
            'app-1',
            expect.objectContaining({
                adopterName: '홍길동',
                standardResponses: expect.objectContaining({ selfIntroduction: '수정된 자기소개' }),
            }),
        );
        expect(result.message).toBe('입양 신청서가 성공적으로 수정되었습니다.');
    });

    it('본인 신청이 아니거나 존재하지 않으면 DomainNotFoundError를 던진다', async () => {
        adopterApplicationCommandPort.findByIdAndAdopter.mockResolvedValue(null);

        await expect(useCase.execute('adopter-1', 'app-1', baseDto)).rejects.toThrow(DomainNotFoundError);
        expect(adopterApplicationCommandPort.updateContent).not.toHaveBeenCalled();
    });

    it('상담 대기 상태가 아니면 DomainValidationError를 던진다', async () => {
        adopterApplicationCommandPort.findByIdAndAdopter.mockResolvedValue({
            ...mockApplication,
            status: 'consultation_completed',
        });

        await expect(useCase.execute('adopter-1', 'app-1', baseDto)).rejects.toThrow(DomainValidationError);
        expect(adopterApplicationCommandPort.updateContent).not.toHaveBeenCalled();
    });
});
