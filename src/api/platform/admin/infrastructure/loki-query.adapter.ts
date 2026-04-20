import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { ILokiQueryPort, LokiLogEntry, LokiQueryOptions } from '../application/ports/loki-query.port';

interface LokiStream {
    stream: {
        level?: string;
        context?: string;
        deployment?: string;
        [key: string]: string | undefined;
    };
    values: [string, string][];
}

interface LokiQueryRangeResponse {
    status: string;
    data: {
        resultType: string;
        result: LokiStream[];
    };
}

/**
 * Loki Query Adapter
 *
 * Loki의 query_range HTTP API를 호출하여 로그를 가져옵니다.
 * LogQL: {app="pawpong-backend", level=~"error|warn"}
 */
@Injectable()
export class LokiQueryAdapter implements ILokiQueryPort {
    private readonly lokiUrl: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly logger: CustomLoggerService,
    ) {
        this.lokiUrl = this.configService.get<string>('LOKI_URL') ?? 'http://loki:3100';
    }

    /**
     * error/warn 레벨 로그를 조회합니다.
     * Loki에 접근할 수 없는 경우 빈 배열을 반환합니다.
     */
    async queryErrorsAndWarnings(options: LokiQueryOptions): Promise<LokiLogEntry[]> {
        const query = `{app="pawpong-backend", level=~"error|warn"}`;

        try {
            const response = await axios.get<LokiQueryRangeResponse>(
                `${this.lokiUrl}/loki/api/v1/query_range`,
                {
                    params: {
                        query,
                        start: options.from,
                        end: options.to,
                        limit: options.limit,
                        direction: 'backward',
                    },
                    timeout: 10_000,
                },
            );

            return this.parseStreams(response.data.data?.result ?? []);
        } catch (error) {
            this.logger.logError(
                'queryErrorsAndWarnings',
                'Loki 쿼리 실패 — 빈 결과 반환',
                error,
                LokiQueryAdapter.name,
            );
            return [];
        }
    }

    /**
     * Loki /ready 엔드포인트로 가용 여부를 확인합니다.
     */
    async isAvailable(): Promise<boolean> {
        try {
            await axios.get(`${this.lokiUrl}/ready`, { timeout: 3_000 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Loki stream 배열을 LokiLogEntry 배열로 파싱합니다.
     * nanoTs는 나노초 단위 — 앞 13자리를 잘라 밀리초로 변환합니다.
     */
    private parseStreams(streams: LokiStream[]): LokiLogEntry[] {
        const entries: LokiLogEntry[] = [];

        for (const stream of streams) {
            const { level = 'unknown', context = '', deployment = '' } = stream.stream;

            for (const [nanoTs, message] of stream.values) {
                const ms = Number(nanoTs.slice(0, 13));
                entries.push({
                    timestamp: new Date(ms).toISOString(),
                    level,
                    context,
                    message,
                    deployment,
                });
            }
        }

        return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
}
