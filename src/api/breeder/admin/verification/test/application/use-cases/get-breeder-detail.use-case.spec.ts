import { DomainAuthorizationError } from '../../../../../../../common/error/domain.error';
import { GetBreederDetailUseCase } from '../../../application/use-cases/get-breeder-detail.use-case';
import { BreederVerificationAdminDetailMapperService } from '../../../domain/services/breeder-verification-admin-detail-mapper.service';
import { BreederVerificationAdminPolicyService } from '../../../domain/services/breeder-verification-admin-policy.service';

describe('브리더 상세 조회 유스케이스', () => {
    const reader = {
        findAdminById: jest.fn(),
        findBreederById: jest.fn(),
    };
    const detailMapperService = new BreederVerificationAdminDetailMapperService({
        generateOne: jest.fn((fileName: string) => `https://cdn.test/${fileName}`),
    } as any);
    const useCase = new GetBreederDetailUseCase(
        reader as any,
        new BreederVerificationAdminPolicyService(),
        detailMapperService,
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('대체 제출 시각과 파일 주소를 포함해 상세 응답을 만든다', async () => {
        reader.findAdminById.mockResolvedValue({
            id: 'admin-1',
            name: '관리자',
            permissions: { canManageBreeders: true },
        });
        reader.findBreederById.mockResolvedValue({
            id: 'breeder-1',
            nickname: '행복브리더',
            name: '행복농장',
            emailAddress: 'breeder@test.com',
            phoneNumber: '010-1111-2222',
            verification: {
                status: 'pending',
                plan: 'basic',
                level: 'new',
                documents: [
                    { type: 'id_card', fileName: 'b.pdf', uploadedAt: new Date('2024-01-03T00:00:00.000Z') },
                    { type: 'license', fileName: 'a.pdf', uploadedAt: new Date('2024-01-01T00:00:00.000Z') },
                ],
            },
            profile: {
                location: { city: '서울', district: '강남' },
                specialization: ['dog'],
                description: '소개',
                experienceYears: 3,
            },
            breeds: ['푸들'],
            createdAt: new Date('2024-01-10T00:00:00.000Z'),
            updatedAt: new Date('2024-01-11T00:00:00.000Z'),
        });

        const result = await useCase.execute('admin-1', 'breeder-1');

        expect(result.verificationInfo.submittedAt).toEqual(new Date('2024-01-01T00:00:00.000Z'));
        expect(result.verificationInfo.documents?.[0]).toEqual(
            expect.objectContaining({
                fileName: 'b.pdf',
                fileUrl: 'https://cdn.test/b.pdf',
            }),
        );
    });

    it('권한이 없으면 예외를 던진다', async () => {
        reader.findAdminById.mockResolvedValue(null);

        await expect(useCase.execute('admin-1', 'breeder-1')).rejects.toThrow(
            new DomainAuthorizationError('브리더 관리 권한이 없습니다.'),
        );
    });
});
