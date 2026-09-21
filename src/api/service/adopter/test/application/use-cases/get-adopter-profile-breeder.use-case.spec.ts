import { GetAdopterProfileUseCase } from '../../../application/use-cases/get-adopter-profile.use-case';
import { AdopterProfileResultMapperService } from '../../../domain/services/adopter-profile-result-mapper.service';

describe('신청자 프로필 조회 — 브리더도 열려야 한다', () => {
    const breederRecord = {
        _id: { toString: () => 'breeder-1' },
        name: '포퐁 켄넬',
        emailAddress: 'breeder@test.com',
        phoneNumber: '010-1111-2222',
        profileImageFileName: 'breeder.jpg',
        accountStatus: 'active',
        favoriteBreederList: [],
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-02-01'),
    };

    function setup(record: unknown) {
        const findById = jest.fn().mockResolvedValue(record);
        const useCase = new GetAdopterProfileUseCase(
            { findById } as any,
            { generateOneSafe: jest.fn().mockReturnValue('signed-url') } as any,
            new AdopterProfileResultMapperService(),
        );
        return { useCase, findById };
    }

    it('브리더 role 을 저장소까지 전달한다 (누락하면 adopters 에서 찾다가 404)', async () => {
        const { useCase, findById } = setup(breederRecord);

        await useCase.execute('breeder-1', 'breeder');

        expect(findById).toHaveBeenCalledWith('breeder-1', 'breeder');
    });

    it('브리더도 200 으로 프로필을 받는다', async () => {
        const { useCase } = setup(breederRecord);

        const result = await useCase.execute('breeder-1', 'breeder');

        expect(result.adopterId).toBe('breeder-1');
        expect(result.emailAddress).toBe('breeder@test.com');
        expect(result.profileImageFileName).toBe('signed-url');
    });

    it('닉네임이 없으면 브리더명(name)으로 채운다', async () => {
        const { useCase } = setup(breederRecord);

        const result = await useCase.execute('breeder-1', 'breeder');

        expect(result.nickname).toBe('포퐁 켄넬');
    });

    it('조사 건너뜀 판정 필드가 undefined 가 아니라 null 이다 (프론트 분기 보호)', async () => {
        const { useCase } = setup(breederRecord);

        const result = await useCase.execute('breeder-1', 'breeder');

        expect(result.counselDefaultProfile).toBeNull();
        expect('counselDefaultProfile' in result).toBe(true);
    });

    it('입양자 고유 이력은 빈 배열로 채워 응답 계약을 지킨다', async () => {
        const { useCase } = setup(breederRecord);

        const result = await useCase.execute('breeder-1', 'breeder');

        expect(result.adoptionApplicationList).toEqual([]);
        expect(result.writtenReviewList).toEqual([]);
        expect(result.favoriteBreederList).toEqual([]);
    });

    it('응답 필드 집합이 입양자 응답과 완전히 동일하다 (DTO 계약 불변)', async () => {
        const adopterRecord = {
            _id: { toString: () => 'adopter-1' },
            emailAddress: 'adopter@test.com',
            nickname: '입양자',
            profileImageFileName: 'profile.jpg',
            accountStatus: 'active',
            favoriteBreederList: [],
            adoptionApplicationList: [],
            writtenReviewList: [],
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-02-01'),
        };

        const adopterResult = await setup(adopterRecord).useCase.execute('adopter-1', 'adopter');
        const breederResult = await setup(breederRecord).useCase.execute('breeder-1', 'breeder');

        expect(Object.keys(breederResult).sort()).toEqual(Object.keys(adopterResult).sort());
    });

    it('입양자 경로는 기존과 동일하게 동작한다 (role 없이 호출해도 됨)', async () => {
        const adopterRecord = {
            _id: { toString: () => 'adopter-1' },
            emailAddress: 'adopter@test.com',
            nickname: '입양자',
            accountStatus: 'active',
            counselDefaultProfile: { selfIntroduction: '안녕하세요' },
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-02-01'),
        };
        const { useCase, findById } = setup(adopterRecord);

        const result = await useCase.execute('adopter-1');

        expect(findById).toHaveBeenCalledWith('adopter-1', undefined);
        expect(result.nickname).toBe('입양자');
        expect(result.counselDefaultProfile).toEqual({ selfIntroduction: '안녕하세요' });
    });

    it('브리더도 없으면 기존과 같은 도메인 에러를 던진다', async () => {
        const { useCase } = setup(null);

        await expect(useCase.execute('breeder-1', 'breeder')).rejects.toThrow('입양자 정보를 찾을 수 없습니다.');
    });
});
