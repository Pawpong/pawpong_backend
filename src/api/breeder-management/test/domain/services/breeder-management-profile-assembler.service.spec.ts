import { BreederManagementProfileAssemblerService } from '../../../domain/services/breeder-management-profile-assembler.service';

const fileUrlPort = {
    generateOne: jest.fn((f: string) => `https://cdn/${f}`),
    generateMany: jest.fn((arr: string[]) => arr.map((f) => `https://cdn/${f}`)),
    generateOneSafe: jest.fn((f?: string) => (f ? `https://cdn/${f}` : undefined)),
} as any;

function makeBreeder(overrides: any = {}): any {
    return {
        _id: 'b-1',
        name: '브리더',
        emailAddress: 'b@e.com',
        phoneNumber: '010',
        accountStatus: 'active',
        petType: 'dog',
        socialAuthInfo: { authProvider: 'kakao' },
        marketingAgreed: true,
        profileImageFileName: 'p.png',
        breeds: ['푸들'],
        verification: {
            status: 'approved',
            documents: [{ type: 'idCard', fileName: 'verification/id.pdf', uploadedAt: new Date() }],
        },
        profile: {
            representativePhotos: ['r.png'],
            priceRange: { min: 100, max: 300 },
        },
        ...overrides,
    };
}

describe('BreederManagementProfileAssemblerService', () => {
    const service = new BreederManagementProfileAssemblerService();

    it('기본 프로필을 구성하고 서명 URL을 생성한다', () => {
        const result = service.toResponse(makeBreeder(), [], [], fileUrlPort);
        expect(result.authProvider).toBe('kakao');
        expect(result.marketingAgreed).toBe(true);
        expect((result.profileInfo as any)?.priceRange).toEqual({ min: 100, max: 300, display: 'range' });
        expect((result.verificationInfo as any)?.documents[0].url).toBe('https://cdn/verification/id.pdf');
    });

    it('authProvider가 없으면 local, marketingAgreed 기본 false', () => {
        const result = service.toResponse(
            makeBreeder({ socialAuthInfo: undefined, marketingAgreed: undefined }),
            [],
            [],
            fileUrlPort,
        );
        expect(result.authProvider).toBe('local');
        expect(result.marketingAgreed).toBe(false);
    });

    it('priceRange이 없으면 not_set', () => {
        const result = service.toResponse(makeBreeder({ profile: { representativePhotos: [] } }), [], [], fileUrlPort);
        expect((result.profileInfo as any)?.priceRange).toEqual({ min: 0, max: 0, display: 'not_set' });
    });

    it('consultationAgreed 기본값은 true', () => {
        const result = service.toResponse(makeBreeder({ consultationAgreed: undefined }), [], [], fileUrlPort);
        expect(result.consultationAgreed).toBe(true);
    });

    it('parentPets의 photoFileName은 photos에서 제외한다', () => {
        const parentPet = {
            _id: 'p-1',
            name: '엄마',
            photoFileName: 'main.jpg',
            photos: ['main.jpg', 'extra.jpg'],
        } as any;
        const result = service.toResponse(makeBreeder(), [parentPet], [], fileUrlPort);
        expect((result.parentPetInfo as any)?.[0].photos).toEqual(['https://cdn/extra.jpg']);
    });
});
