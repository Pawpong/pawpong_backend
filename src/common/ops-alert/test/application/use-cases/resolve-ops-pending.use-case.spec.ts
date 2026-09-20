import { ConfigService } from '@nestjs/config';

import { OPS_PENDING_KIND } from '../../../../events/ops-pending.event';
import { CustomLoggerService } from '../../../../logger/custom-logger.service';
import { ResolveOpsPendingUseCase } from '../../../application/use-cases/resolve-ops-pending.use-case';

describe('ResolveOpsPendingUseCase', () => {
    let repository: { resolve: jest.Mock };
    let logger: { logSuccess: jest.Mock };

    const buildUseCase = (environment: string) =>
        new ResolveOpsPendingUseCase(
            repository as never,
            { get: (key: string) => (key === 'APP_ENV' ? environment : undefined) } as ConfigService,
            logger as unknown as CustomLoggerService,
        );

    beforeEach(() => {
        repository = { resolve: jest.fn().mockResolvedValue(1) };
        logger = { logSuccess: jest.fn() };
    });

    it('자기 환경의 대기 건만 닫는다', async () => {
        // 로컬과 dev 서버가 같은 데이터베이스를 쓰므로, 환경을 빼면 남의 대기 상태를 대신 지운다
        await buildUseCase('development').execute({
            kind: OPS_PENDING_KIND.BREEDER_REPORT,
            referenceId: 'report-1',
            resolution: 'resolve',
        });

        expect(repository.resolve).toHaveBeenCalledWith(
            'development',
            OPS_PENDING_KIND.BREEDER_REPORT,
            'report-1',
            'resolve',
            expect.any(Date),
        );
    });

    it('처리 방식이 없으면 기본 문구로 닫는다', async () => {
        await buildUseCase('production').execute({
            kind: OPS_PENDING_KIND.COMMUNITY_REPORT,
            referenceId: 'post-1',
        });

        expect(repository.resolve).toHaveBeenCalledWith(
            'production',
            OPS_PENDING_KIND.COMMUNITY_REPORT,
            'post-1',
            '처리완료',
            expect.any(Date),
        );
    });
});
