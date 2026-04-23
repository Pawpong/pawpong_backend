import { UpdateAdopterProfileUseCase } from '../../../application/use-cases/update-adopter-profile.use-case';
import { AdopterProfileUpdateMapperService } from '../../../domain/services/adopter-profile-update-mapper.service';

describe('입양자 프로필 수정 유스케이스', () => {
    it('프로필 수정 데이터를 변환기 형식으로 변환해 저장한다', async () => {
        const adopterProfilePort = {
            updateProfile: jest.fn().mockResolvedValue({
                _id: { toString: () => 'adopter-1' },
            }),
        };
        const useCase = new UpdateAdopterProfileUseCase(
            adopterProfilePort as any,
            new AdopterProfileUpdateMapperService(),
        );

        await expect(
            useCase.execute('adopter-1', {
                name: '새 이름',
                phone: '010-1234-5678',
                profileImage: 'profile.jpg',
            }),
        ).resolves.toEqual({ message: '프로필이 성공적으로 수정되었습니다.' });

        expect(adopterProfilePort.updateProfile).toHaveBeenCalledWith(
            'adopter-1',
            expect.objectContaining({
                fullName: '새 이름',
                phoneNumber: '010-1234-5678',
                profileImageFileName: 'profile.jpg',
            }),
        );
    });
});
