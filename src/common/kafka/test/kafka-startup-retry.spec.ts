import { KafkaStartupRetry } from '../kafka-startup-retry';

describe('KafkaStartupRetry', () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    it('최초 연결 실패 뒤 예약 시간에 다시 시작한다', async () => {
        jest.useFakeTimers();
        const start = jest.fn().mockRejectedValueOnce(new Error('broker unavailable')).mockResolvedValue(undefined);
        const onStarted = jest.fn();
        const onFailure = jest.fn();
        const retry = new KafkaStartupRetry({ start, retryDelayMs: 100, onStarted, onFailure });

        await expect(retry.start()).resolves.toBe(false);
        expect(onFailure).toHaveBeenCalledWith(expect.any(Error), 100);

        await jest.advanceTimersByTimeAsync(100);

        expect(start).toHaveBeenCalledTimes(2);
        expect(onStarted).toHaveBeenCalledTimes(1);
        expect(retry.isStarted()).toBe(true);
        retry.stop();
    });

    it('중단하면 예약된 재시도를 실행하지 않는다', async () => {
        jest.useFakeTimers();
        const start = jest.fn().mockRejectedValue(new Error('broker unavailable'));
        const retry = new KafkaStartupRetry({
            start,
            retryDelayMs: 100,
            onStarted: jest.fn(),
            onFailure: jest.fn(),
        });

        await retry.start();
        retry.stop();
        await jest.advanceTimersByTimeAsync(100);

        expect(start).toHaveBeenCalledTimes(1);
    });
});
