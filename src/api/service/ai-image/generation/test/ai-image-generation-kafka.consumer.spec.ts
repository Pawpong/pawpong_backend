import { AiImageGenerationKafkaConsumer } from '../ai-image-generation-kafka.consumer';
import type { ApplyAiImageGenerationResultUseCase } from '../application/use-cases/apply-ai-image-generation-result.use-case';
import type { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';

describe('AiImageGenerationKafkaConsumer', () => {
    let consumer: AiImageGenerationKafkaConsumer;
    let applyUseCase: jest.Mocked<Pick<ApplyAiImageGenerationResultUseCase, 'execute'>>;
    let logger: jest.Mocked<Pick<CustomLoggerService, 'logError' | 'logWarning'>>;

    beforeEach(() => {
        applyUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
        logger = { logError: jest.fn(), logWarning: jest.fn() };
        consumer = new AiImageGenerationKafkaConsumer(
            applyUseCase as unknown as ApplyAiImageGenerationResultUseCase,
            logger as unknown as CustomLoggerService,
        );
    });

    const successEvent = {
        id: 'job-1',
        jobId: 'job-1',
        status: 'succeeded',
        outputObjectKey: 'ai-image/result/job-1.png',
        completedAt: '2026-07-25T00:00:00.000Z',
    };

    it('성공 결과를 유스케이스로 전달한다', async () => {
        await consumer.handleGenerationResult(successEvent);
        expect(applyUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({ jobId: 'job-1', status: 'succeeded' }));
    });

    it('문자열 payload 도 파싱한다', async () => {
        await consumer.handleGenerationResult(JSON.stringify(successEvent));
        expect(applyUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('실패 결과를 errorCode 와 함께 전달한다', async () => {
        await consumer.handleGenerationResult({
            id: 'job-2',
            jobId: 'job-2',
            status: 'failed',
            errorCode: 'OPENAI_GENERATION_FAILED',
            completedAt: '2026-07-25T00:00:00.000Z',
        });
        expect(applyUseCase.execute).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'failed', errorCode: 'OPENAI_GENERATION_FAILED' }),
        );
    });

    it('jobId 가 없는 메시지는 폐기한다', async () => {
        await consumer.handleGenerationResult({ status: 'succeeded' });
        expect(applyUseCase.execute).not.toHaveBeenCalled();
        expect(logger.logWarning).toHaveBeenCalled();
    });

    it('알 수 없는 status 는 폐기한다', async () => {
        await consumer.handleGenerationResult({ jobId: 'job-3', status: 'weird' });
        expect(applyUseCase.execute).not.toHaveBeenCalled();
    });

    it('성공인데 outputObjectKey 가 없으면 폐기한다', async () => {
        await consumer.handleGenerationResult({ jobId: 'job-4', status: 'succeeded' });
        expect(applyUseCase.execute).not.toHaveBeenCalled();
        expect(logger.logWarning).toHaveBeenCalled();
    });

    it('유스케이스가 실패해도 throw 하지 않는다 (오프셋 커밋 차단 방지)', async () => {
        applyUseCase.execute.mockRejectedValueOnce(new Error('DB 오류'));
        await expect(consumer.handleGenerationResult(successEvent)).resolves.toBeUndefined();
        expect(logger.logError).toHaveBeenCalled();
    });

    it('깨진 JSON 문자열도 throw 하지 않는다', async () => {
        await expect(consumer.handleGenerationResult('{broken')).resolves.toBeUndefined();
        expect(logger.logError).toHaveBeenCalled();
    });
});
