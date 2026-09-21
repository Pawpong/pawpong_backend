import { ConfigService } from '@nestjs/config';

import { OPS_PENDING_KIND } from '../../../../events/ops-pending.event';
import { CustomLoggerService } from '../../../../logger/custom-logger.service';
import { RecordOpsPendingUseCase } from '../../../application/use-cases/record-ops-pending.use-case';
import { OpsAlertPresenterService } from '../../../domain/services/ops-alert-presenter.service';

describe('RecordOpsPendingUseCase', () => {
    let repository: { insert: jest.Mock };
    let logger: { logWarning: jest.Mock; logSuccess: jest.Mock; logError: jest.Mock };

    const command = {
        kind: OPS_PENDING_KIND.BREEDER_REPORT,
        referenceId: 'report-1',
        summary: '브리더 신고가 접수되었습니다.',
    };

    const buildUseCase = () =>
        new RecordOpsPendingUseCase(
            repository as never,
            new OpsAlertPresenterService(),
            { get: (key: string) => (key === 'APP_ENV' ? 'production' : undefined) } as ConfigService,
            logger as unknown as CustomLoggerService,
        );

    beforeEach(() => {
        repository = { insert: jest.fn().mockResolvedValue(true) };
        logger = { logWarning: jest.fn(), logSuccess: jest.fn(), logError: jest.fn() };
    });

    it('접수를 큐에 적재하면서 어드민 경로를 함께 저장한다', async () => {
        await buildUseCase().execute(command);

        expect(repository.insert).toHaveBeenCalledWith(
            expect.objectContaining({
                kind: OPS_PENDING_KIND.BREEDER_REPORT,
                referenceId: 'report-1',
                adminPath: '/reports/breeders',
                environment: 'production',
            }),
        );
    });

    it('일시적인 DB 오류는 재시도해서 접수를 살린다', async () => {
        // 여기서 그냥 포기하면 운영은 신고가 들어온 사실 자체를 모른다
        repository.insert.mockRejectedValueOnce(new Error('connection reset')).mockResolvedValueOnce(true);

        await buildUseCase().execute(command);

        expect(repository.insert).toHaveBeenCalledTimes(2);
    });

    it('재시도를 모두 실패하면 예외를 올려 호출부가 로그를 남기게 한다', async () => {
        repository.insert.mockRejectedValue(new Error('db down'));

        await expect(buildUseCase().execute(command)).rejects.toThrow('db down');
        expect(repository.insert).toHaveBeenCalledTimes(3);
    });

    it('이미 대기 중인 같은 건은 다시 적재하지 않는다', async () => {
        repository.insert.mockResolvedValueOnce(false);

        await buildUseCase().execute(command);

        expect(logger.logWarning).toHaveBeenCalled();
    });
});
