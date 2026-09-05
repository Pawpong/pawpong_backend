interface KafkaStartupRetryOptions {
    start: () => Promise<void>;
    retryDelayMs: number;
    onStarted: () => void;
    onFailure: (error: unknown, retryDelayMs: number) => void;
}

/**
 * HTTP 서버와 독립적으로 Kafka consumer 기동을 재시도한다.
 *
 * 브로커가 앱보다 늦게 준비되는 배포에서도 프로세스를 재시작하지 않고
 * consumer가 합류하도록 하되, timer는 Node 프로세스 종료를 붙잡지 않는다.
 */
export class KafkaStartupRetry {
    private retryTimer?: ReturnType<typeof setTimeout>;
    private running = false;
    private started = false;
    private stopped = false;

    constructor(private readonly options: KafkaStartupRetryOptions) {}

    async start(): Promise<boolean> {
        if (this.stopped || this.started || this.running) {
            return this.started;
        }

        this.running = true;
        try {
            await this.options.start();
            this.started = true;
            this.options.onStarted();
            return true;
        } catch (error) {
            this.options.onFailure(error, this.options.retryDelayMs);
            this.scheduleRetry();
            return false;
        } finally {
            this.running = false;
        }
    }

    stop(): void {
        this.stopped = true;
        if (this.retryTimer) {
            clearTimeout(this.retryTimer);
            this.retryTimer = undefined;
        }
    }

    isStarted(): boolean {
        return this.started;
    }

    private scheduleRetry(): void {
        if (this.stopped || this.started || this.retryTimer) {
            return;
        }

        this.retryTimer = setTimeout(() => {
            this.retryTimer = undefined;
            void this.start();
        }, this.options.retryDelayMs);
        this.retryTimer.unref?.();
    }
}
