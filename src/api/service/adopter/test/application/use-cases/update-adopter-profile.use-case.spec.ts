import { UpdateAdopterProfileUseCase } from '../../../application/use-cases/update-adopter-profile.use-case';
import { AdopterProfileUpdateMapperService } from '../../../domain/services/adopter-profile-update-mapper.service';
import { USER_PROFILE_UPDATED_EVENT } from '../../../../../../common/events/user-profile-updated.event';

describe('입양자 프로필 수정 유스케이스', () => {
    const makeUseCase = (updateProfile: jest.Mock) => {
        const adopterProfilePort = { updateProfile };
        const eventEmitter = { emit: jest.fn() };
        const useCase = new UpdateAdopterProfileUseCase(
            adopterProfilePort as any,
            new AdopterProfileUpdateMapperService(),
            eventEmitter as any,
        );
        return { useCase, adopterProfilePort, eventEmitter };
    };

    it("'name' 을 표시용 nickname 으로 변환해 저장한다", async () => {
        const updateProfile = jest.fn().mockResolvedValue({ _id: { toString: () => 'adopter-1' } });
        const { useCase, adopterProfilePort } = makeUseCase(updateProfile);

        await expect(
            useCase.execute('adopter-1', {
                name: '장원영',
                phone: '010-1234-5678',
                profileImage: 'profile.jpg',
            }),
        ).resolves.toEqual({ message: '프로필이 성공적으로 수정되었습니다.' });

        expect(adopterProfilePort.updateProfile).toHaveBeenCalledWith(
            'adopter-1',
            expect.objectContaining({
                nickname: '장원영',
                phoneNumber: '010-1234-5678',
                profileImageFileName: 'profile.jpg',
            }),
        );
    });

    it('닉네임/프로필 이미지 변경 시 동기화 이벤트를 발행한다', async () => {
        const updateProfile = jest.fn().mockResolvedValue({ _id: { toString: () => 'adopter-1' } });
        const { useCase, eventEmitter } = makeUseCase(updateProfile);

        await useCase.execute('adopter-1', { name: '장원영', profileImage: 'profile.jpg' });

        expect(eventEmitter.emit).toHaveBeenCalledWith(USER_PROFILE_UPDATED_EVENT, {
            userId: 'adopter-1',
            nickname: '장원영',
            profileImageFileName: 'profile.jpg',
        });
    });

    it('닉네임/이미지 변경이 없으면(전화번호만) 이벤트를 발행하지 않는다', async () => {
        const updateProfile = jest.fn().mockResolvedValue({ _id: { toString: () => 'adopter-1' } });
        const { useCase, eventEmitter } = makeUseCase(updateProfile);

        await useCase.execute('adopter-1', { phone: '010-0000-0000' });

        expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
});
