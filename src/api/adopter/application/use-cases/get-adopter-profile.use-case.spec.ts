import { GetAdopterProfileUseCase } from './get-adopter-profile.use-case';

describe('입양자 프로필 조회 유스케이스', () => {
    it('입양자 프로필을 조회하고 프로필 이미지를 signed 주소로 변환한다', async () => {
        const useCase = new GetAdopterProfileUseCase(
            {
                findById: jest.fn().mockResolvedValue({
                    _id: { toString: () => 'adopter-1' },
                    emailAddress: 'adopter@test.com',
                    nickname: '입양자',
                    profileImageFileName: 'profile.jpg',
                    accountStatus: 'active',
                    favoriteBreederList: [],
                    adoptionApplicationList: [],
                    writtenReviewList: [],
                }),
            } as any,
            {
                generateOneSafe: jest.fn().mockReturnValue('signed-profile'),
            } as any,
        );

        await expect(useCase.execute('adopter-1')).resolves.toMatchObject({
            profileImageFileName: 'signed-profile',
            nickname: '입양자',
        });
    });
});
