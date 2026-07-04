import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import { USER_PROFILE_UPDATED_EVENT } from '../../../../../common/events/user-profile-updated.event';

import { UpdateBreederManagementProfileUseCase } from '../../../application/use-cases/update-breeder-management-profile.use-case';
import { BreederManagementProfileUpdateMapperService } from '../../../domain/services/breeder-management-profile-update-mapper.service';
import { BreederManagementProfileCommandResultMapperService } from '../../../domain/services/breeder-management-profile-command-result-mapper.service';

describe('브리더 프로필 수정 유스케이스', () => {
    const breederManagementProfilePort = {
        findByIdWithAllData: jest.fn(),
        updateProfile: jest.fn(),
    };

    const eventEmitter = { emit: jest.fn() };

    const useCase = new UpdateBreederManagementProfileUseCase(
        breederManagementProfilePort as any,
        new BreederManagementProfileUpdateMapperService(),
        new BreederManagementProfileCommandResultMapperService(),
        eventEmitter as any,
    );

    const mockBreeder = {
        _id: 'breeder-1',
        name: '행복브리더',
        profile: {
            location: { city: '서울', district: '강남구' },
            specialization: ['dog'],
            introduction: '안녕하세요.',
        },
    };

    const mockUpdateData = {
        introduction: '반갑습니다.',
        location: { city: '경기', district: '성남시' },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정상적으로 프로필을 수정한다', async () => {
        breederManagementProfilePort.findByIdWithAllData.mockResolvedValue(mockBreeder);
        breederManagementProfilePort.updateProfile.mockResolvedValue(undefined);

        const result = await useCase.execute('breeder-1', mockUpdateData as any);

        expect(result.message).toBeDefined();
        expect(breederManagementProfilePort.findByIdWithAllData).toHaveBeenCalledWith('breeder-1');
        expect(breederManagementProfilePort.updateProfile).toHaveBeenCalledWith('breeder-1', expect.any(Object));
        // 표시 정보(nickname/profileImageFileName) 변경이 없으면 동기화 이벤트를 발행하지 않는다.
        expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('브리더를 찾을 수 없으면 도메인 not found 예외를 던진다', async () => {
        breederManagementProfilePort.findByIdWithAllData.mockResolvedValue(null);

        await expect(useCase.execute('unknown-id', mockUpdateData as any)).rejects.toThrow(DomainNotFoundError);
        await expect(useCase.execute('unknown-id', mockUpdateData as any)).rejects.toThrow(
            '브리더 정보를 찾을 수 없습니다.',
        );
        expect(breederManagementProfilePort.updateProfile).not.toHaveBeenCalled();
        expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('프로필 이미지 변경 시 프로필 동기화 이벤트를 발행한다', async () => {
        breederManagementProfilePort.findByIdWithAllData.mockResolvedValue(mockBreeder);
        breederManagementProfilePort.updateProfile.mockResolvedValue(undefined);

        await useCase.execute('breeder-1', { profileImage: 'profiles/new.png' } as any);

        expect(eventEmitter.emit).toHaveBeenCalledWith(USER_PROFILE_UPDATED_EVENT, {
            userId: 'breeder-1',
            nickname: undefined,
            profileImageFileName: 'profiles/new.png',
        });
    });

    it('프로필 이미지 제거(빈 문자열) 시에도 동기화 이벤트를 발행한다', async () => {
        breederManagementProfilePort.findByIdWithAllData.mockResolvedValue(mockBreeder);
        breederManagementProfilePort.updateProfile.mockResolvedValue(undefined);

        await useCase.execute('breeder-1', { profileImage: '' } as any);

        expect(eventEmitter.emit).toHaveBeenCalledWith(USER_PROFILE_UPDATED_EVENT, {
            userId: 'breeder-1',
            nickname: undefined,
            profileImageFileName: '',
        });
    });
});
