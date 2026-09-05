import { BreederManagementVerificationDraftStoreAdapter } from '../../infrastructure/breeder-management-verification-draft-store.adapter';
import type { RedisService } from '../../../../../common/redis/redis.module';

describe('BreederManagementVerificationDraftStoreAdapter', () => {
    const redisService = {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
    };
    const adapter = new BreederManagementVerificationDraftStoreAdapter(redisService as unknown as RedisService);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('사용자별 키에 1시간 TTL로 업로드 초안을 저장한다', async () => {
        const documents = [{ type: 'idCard', fileName: 'verification/breeder-1/id.pdf' }];

        await adapter.save('breeder-1', documents);

        expect(redisService.set).toHaveBeenCalledWith(
            'breeder-management:verification-draft:breeder-1',
            JSON.stringify(documents),
            3600,
        );
    });

    it('손상되거나 잘못된 캐시 값은 빈 초안으로 처리한다', async () => {
        redisService.get.mockResolvedValueOnce('{broken');
        await expect(adapter.get('breeder-1')).resolves.toEqual([]);

        redisService.get.mockResolvedValueOnce(JSON.stringify([{ type: 1, fileName: null }]));
        await expect(adapter.get('breeder-1')).resolves.toEqual([]);
    });

    it('유효한 초안만 복원하고 제출 후 키를 삭제한다', async () => {
        redisService.get.mockResolvedValue(
            JSON.stringify([
                { type: 'idCard', fileName: 'verification/breeder-1/id.pdf' },
                { type: null, fileName: 'invalid' },
            ]),
        );

        await expect(adapter.get('breeder-1')).resolves.toEqual([
            { type: 'idCard', fileName: 'verification/breeder-1/id.pdf' },
        ]);
        await adapter.delete('breeder-1');

        expect(redisService.del).toHaveBeenCalledWith('breeder-management:verification-draft:breeder-1');
    });
});
