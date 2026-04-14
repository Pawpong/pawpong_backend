import { BadRequestException, ConflictException } from '@nestjs/common';

import { CreateAdopterApplicationUseCase } from '../../../application/use-cases/create-adopter-application.use-case';
import { AdopterApplicationCreateResultMapperService } from '../../../domain/services/adopter-application-create-result-mapper.service';
import { AdopterApplicationCustomAnswerBuilderService } from '../../../domain/services/adopter-application-custom-answer-builder.service';
import { AdopterApplicationStandardAnswerBuilderService } from '../../../domain/services/adopter-application-standard-answer-builder.service';
import { ApplicationStatus } from '../../../../../common/enum/user.enum';

describe('상담 신청 생성 유스케이스', () => {
    const adopterProfilePort = { findById: jest.fn() };
    const adopterBreederReaderPort = { findById: jest.fn() };
    const adopterPetReaderPort = { findByIdAndBreeder: jest.fn() };
    const adopterApplicationCommandPort = {
        findPendingByAdopterAndBreeder: jest.fn(),
        create: jest.fn(),
    };
    const adopterApplicationNotifierPort = {
        notifyBreederOfNewApplication: jest.fn(),
        notifyApplicantApplicationConfirmed: jest.fn(),
    };

    const useCase = new CreateAdopterApplicationUseCase(
        adopterProfilePort as any,
        adopterBreederReaderPort as any,
        adopterPetReaderPort as any,
        adopterApplicationCommandPort as any,
        adopterApplicationNotifierPort as any,
        new AdopterApplicationCreateResultMapperService(),
        new AdopterApplicationCustomAnswerBuilderService(),
        new AdopterApplicationStandardAnswerBuilderService(),
    );

    const baseDto = {
        breederId: 'breeder-1',
        privacyConsent: true,
        name: '홍길동',
        email: 'hong@test.com',
        phone: '01012345678',
        selfIntroduction: '안녕하세요',
        familyMembers: '2명',
        allFamilyConsent: true,
        allergyTestInfo: '없음',
        timeAwayFromHome: '8시간',
        livingSpaceDescription: '아파트',
        previousPetExperience: '있음',
        canProvideBasicCare: true,
        canAffordMedicalExpenses: true,
        preferredPetDescription: '활발한 강아지',
        desiredAdoptionTiming: '즉시',
        additionalNotes: '',
    };

    const mockBreeder = {
        _id: { toString: () => 'breeder-1' },
        name: '행복브리더',
        nickname: '행복브리더',
        applicationForm: [],
    };

    const mockSavedApplication = {
        _id: { toString: () => 'app-1' },
        breederId: { toString: () => 'breeder-1' },
        petId: undefined,
        status: ApplicationStatus.CONSULTATION_PENDING,
        appliedAt: new Date('2026-04-01T00:00:00.000Z'),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정상적으로 상담 신청을 생성한다', async () => {
        adopterProfilePort.findById.mockResolvedValue({ userId: 'user-1' });
        adopterBreederReaderPort.findById.mockResolvedValue(mockBreeder);
        adopterApplicationCommandPort.findPendingByAdopterAndBreeder.mockResolvedValue(null);
        adopterApplicationCommandPort.create.mockResolvedValue(mockSavedApplication);
        adopterApplicationNotifierPort.notifyBreederOfNewApplication.mockResolvedValue(undefined);
        adopterApplicationNotifierPort.notifyApplicantApplicationConfirmed.mockResolvedValue(undefined);

        const result = await useCase.execute('user-1', baseDto as any);

        expect(result.applicationId).toBe('app-1');
        expect(result.status).toBe(ApplicationStatus.CONSULTATION_PENDING);
        expect(adopterApplicationCommandPort.create).toHaveBeenCalled();
    });

    it('개인정보 동의가 없으면 BadRequestException을 던진다', async () => {
        adopterProfilePort.findById.mockResolvedValue({ userId: 'user-1' });
        adopterBreederReaderPort.findById.mockResolvedValue(mockBreeder);

        await expect(
            useCase.execute('user-1', { ...baseDto, privacyConsent: false } as any),
        ).rejects.toThrow(BadRequestException);
        await expect(
            useCase.execute('user-1', { ...baseDto, privacyConsent: false } as any),
        ).rejects.toThrow('개인정보 수집 및 이용에 동의해야 신청이 가능합니다.');
    });

    it('입양자 정보가 없으면 BadRequestException을 던진다', async () => {
        adopterProfilePort.findById.mockResolvedValue(null);

        await expect(useCase.execute('user-1', baseDto as any)).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('user-1', baseDto as any)).rejects.toThrow('입양자 정보를 찾을 수 없습니다.');
    });

    it('브리더를 찾을 수 없으면 BadRequestException을 던진다', async () => {
        adopterProfilePort.findById.mockResolvedValue({ userId: 'user-1' });
        adopterBreederReaderPort.findById.mockResolvedValue(null);

        await expect(useCase.execute('user-1', baseDto as any)).rejects.toThrow('해당 브리더를 찾을 수 없습니다.');
    });

    it('이미 대기 중인 신청이 있으면 ConflictException을 던진다', async () => {
        adopterProfilePort.findById.mockResolvedValue({ userId: 'user-1' });
        adopterBreederReaderPort.findById.mockResolvedValue(mockBreeder);
        adopterApplicationCommandPort.findPendingByAdopterAndBreeder.mockResolvedValue({ _id: 'existing-app' });

        await expect(useCase.execute('user-1', baseDto as any)).rejects.toThrow(ConflictException);
        await expect(useCase.execute('user-1', baseDto as any)).rejects.toThrow(
            '해당 브리더에게 이미 대기 중인 상담 신청이 있습니다.',
        );
    });

    it('petId를 포함하면 반려동물 정보를 조회한다', async () => {
        adopterProfilePort.findById.mockResolvedValue({ userId: 'user-1' });
        adopterBreederReaderPort.findById.mockResolvedValue(mockBreeder);
        adopterPetReaderPort.findByIdAndBreeder.mockResolvedValue({ _id: 'pet-1', name: '뽀삐', status: 'available' });
        adopterApplicationCommandPort.findPendingByAdopterAndBreeder.mockResolvedValue(null);
        adopterApplicationCommandPort.create.mockResolvedValue({ ...mockSavedApplication, petId: { toString: () => 'pet-1' } });
        adopterApplicationNotifierPort.notifyBreederOfNewApplication.mockResolvedValue(undefined);
        adopterApplicationNotifierPort.notifyApplicantApplicationConfirmed.mockResolvedValue(undefined);

        const result = await useCase.execute('user-1', { ...baseDto, petId: 'pet-1' } as any);

        expect(adopterPetReaderPort.findByIdAndBreeder).toHaveBeenCalledWith('pet-1', 'breeder-1');
        expect(result.petName).toBe('뽀삐');
    });

    it('분양 신청이 불가능한 반려동물이면 BadRequestException을 던진다', async () => {
        adopterProfilePort.findById.mockResolvedValue({ userId: 'user-1' });
        adopterBreederReaderPort.findById.mockResolvedValue(mockBreeder);
        adopterPetReaderPort.findByIdAndBreeder.mockResolvedValue({ _id: 'pet-1', name: '뽀삐', status: 'adopted' });
        adopterApplicationCommandPort.findPendingByAdopterAndBreeder.mockResolvedValue(null);

        await expect(
            useCase.execute('user-1', { ...baseDto, petId: 'pet-1' } as any),
        ).rejects.toThrow('현재 분양 신청이 불가능한 반려동물입니다.');
    });

    it('브리더 역할로 신청하면 브리더 존재 여부를 확인한다', async () => {
        adopterBreederReaderPort.findById.mockImplementation((id: string) => {
            if (id === 'breeder-self') return { _id: 'breeder-self', name: '자기브리더' };
            if (id === 'breeder-1') return mockBreeder;
            return null;
        });
        adopterApplicationCommandPort.findPendingByAdopterAndBreeder.mockResolvedValue(null);
        adopterApplicationCommandPort.create.mockResolvedValue(mockSavedApplication);
        adopterApplicationNotifierPort.notifyBreederOfNewApplication.mockResolvedValue(undefined);
        adopterApplicationNotifierPort.notifyApplicantApplicationConfirmed.mockResolvedValue(undefined);

        const result = await useCase.execute('breeder-self', baseDto as any, 'breeder');

        expect(result.applicationId).toBe('app-1');
    });
});
