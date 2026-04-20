import { Injectable } from '@nestjs/common';

import { LokiLogEntry } from '../../application/ports/loki-query.port';

/** 이슈 분류 카테고리 */
export type IssueCategory = 'infrastructure' | 'api_error' | 'security_probe' | 'application';

/** 이슈 심각도 */
export type IssueSeverity = 'critical' | 'warning' | 'info';

/** 서비스 상태 */
export type ServiceStatus = 'healthy' | 'warning' | 'error' | 'unknown';

/** 전체 시스템 상태 */
export type OverallStatus = 'healthy' | 'warning' | 'critical';

/**
 * 이슈 그룹 — 동일한 원인의 로그를 묶은 단위
 */
export interface IssueGroup {
    /** 그룹 식별 키 (내부용) */
    groupKey: string;
    /** 이슈 카테고리 */
    category: IssueCategory;
    /** 심각도 */
    severity: IssueSeverity;
    /** PM이 읽는 제목 (한국어) */
    title: string;
    /** PM이 읽는 설명 (한국어) */
    description: string;
    /** 발생 횟수 */
    count: number;
    /** 최초 발생 시각 (ISO 8601) */
    firstAt: string;
    /** 최근 발생 시각 (ISO 8601) */
    lastAt: string;
    /** 30분 이상 재발 없으면 해결된 것으로 판단 */
    isResolved: boolean;
}

/**
 * 서비스별 상태
 */
export interface ServiceHealthInfo {
    /** 채팅 서버 (Kafka) 상태 */
    kafka: { status: ServiceStatus; lastErrorAt: string | null };
    /** Redis 상태 */
    redis: { status: ServiceStatus; lastErrorAt: string | null };
    /** API 서버 상태 */
    api: { status: ServiceStatus; lastErrorAt: string | null };
}

/**
 * 분류 결과
 */
export interface CategorizationResult {
    overallStatus: OverallStatus;
    services: ServiceHealthInfo;
    summary: { critical: number; warning: number; info: number };
    issueGroups: IssueGroup[];
}

/**
 * 로그 분류 Domain Service
 *
 * 순수 비즈니스 규칙만 담당합니다:
 * - 로그 항목을 카테고리/심각도로 분류
 * - 동일 원인의 로그를 그룹핑
 * - 서비스별 상태 판정
 * - 전체 상태 판정
 */
@Injectable()
export class LogCategorizerService {
    /** 30분 경과 시 "해결됨"으로 판단 */
    private static readonly RESOLVED_THRESHOLD_MS = 30 * 60 * 1000;

    /** 1시간 이내 에러 = error 상태 */
    private static readonly ACTIVE_ERROR_THRESHOLD_MS = 60 * 60 * 1000;

    /**
     * Redis 관련 NestJS 컨텍스트 이름 목록.
     * ioredis, @nestjs/cache-manager, nestjs-redis 등에서 발생하는
     * 연결 에러 컨텍스트를 포괄합니다.
     */
    private static readonly REDIS_CONTEXTS = new Set([
        'IoRedis',
        'Redis',
        'RedisModule',
        'RedisService',
        'CacheManager',
    ]);

    /**
     * 로그 항목 배열을 분류하여 시스템 헬스 요약을 반환합니다.
     *
     * @param entries Loki에서 가져온 로그 항목 배열
     * @param now 현재 시각 (테스트 주입 가능)
     */
    categorize(entries: LokiLogEntry[], now: Date = new Date()): CategorizationResult {
        const groups = this.buildIssueGroups(entries, now);
        const services = this.determineServiceHealth(groups, now);
        const overallStatus = this.determineOverallStatus(groups);
        const summary = this.buildSummary(groups);

        return { overallStatus, services, summary, issueGroups: groups };
    }

    // ─────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────

    private buildIssueGroups(entries: LokiLogEntry[], now: Date): IssueGroup[] {
        const groupMap = new Map<string, { entries: LokiLogEntry[]; category: IssueCategory }>();

        for (const entry of entries) {
            const category = this.classifyCategory(entry);
            const groupKey = this.buildGroupKey(entry, category);

            if (!groupMap.has(groupKey)) {
                groupMap.set(groupKey, { entries: [], category });
            }
            groupMap.get(groupKey)!.entries.push(entry);
        }

        const groups: IssueGroup[] = [];

        for (const [groupKey, { entries: groupEntries, category }] of groupMap.entries()) {
            const timestamps = groupEntries.map((e) => new Date(e.timestamp).getTime());
            const firstAt = new Date(Math.min(...timestamps)).toISOString();
            const lastAt = new Date(Math.max(...timestamps)).toISOString();
            const isResolved = now.getTime() - Math.max(...timestamps) > LogCategorizerService.RESOLVED_THRESHOLD_MS;
            const severity = this.determineSeverity(category, isResolved);

            groups.push({
                groupKey,
                category,
                severity,
                title: this.getTitle(groupKey, category),
                description: this.getDescription(groupKey, category),
                count: groupEntries.length,
                firstAt,
                lastAt,
                isResolved,
            });
        }

        return groups.sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
    }

    /**
     * 분류 규칙:
     * - ServerKafka 컨텍스트 → infrastructure
     * - Redis 관련 컨텍스트 → infrastructure
     * - HttpExceptionFilter + /api/ 미포함 경로 → security_probe (봇 스캔)
     * - HttpExceptionFilter + /api/ 포함 경로 → api_error
     * - 그 외 → application
     */
    private classifyCategory(entry: LokiLogEntry): IssueCategory {
        if (entry.context === 'ServerKafka') {
            return 'infrastructure';
        }

        if (
            LogCategorizerService.REDIS_CONTEXTS.has(entry.context) ||
            /redis/i.test(entry.context)
        ) {
            return 'infrastructure';
        }

        if (entry.context === 'HttpExceptionFilter') {
            const isApiPath = /\/api\//.test(entry.message);
            return isApiPath ? 'api_error' : 'security_probe';
        }

        return 'application';
    }

    /**
     * Redis 관련 컨텍스트는 구현 라이브러리가 달라도 하나의 그룹으로 정규화합니다.
     */
    private buildGroupKey(entry: LokiLogEntry, category: IssueCategory): string {
        switch (category) {
            case 'infrastructure':
                if (entry.context === 'ServerKafka') return 'infrastructure:ServerKafka';
                return 'infrastructure:Redis';
            case 'security_probe':
                return 'security_probe';
            case 'api_error':
                return `api_error:${entry.context}`;
            default:
                return `application:${entry.context}`;
        }
    }

    private determineSeverity(category: IssueCategory, isResolved: boolean): IssueSeverity {
        if (category === 'security_probe') return 'info';
        if (category === 'infrastructure') return isResolved ? 'warning' : 'critical';
        return 'warning';
    }

    private getTitle(groupKey: string, category: IssueCategory): string {
        const titleMap: Record<string, string> = {
            'infrastructure:ServerKafka': '채팅 서버 (Kafka) 연결 오류',
            'infrastructure:Redis': 'Redis 캐시 서버 연결 오류',
            security_probe: '외부 자동화 스캔 감지',
        };

        if (titleMap[groupKey]) return titleMap[groupKey];
        if (category === 'api_error') return 'API 오류 발생';
        if (category === 'application') return `애플리케이션 오류 (${groupKey.split(':')[1] ?? groupKey})`;
        return '알 수 없는 오류';
    }

    private getDescription(groupKey: string, category: IssueCategory): string {
        const descMap: Record<string, string> = {
            'infrastructure:ServerKafka': '채팅 메시지 전송에 영향이 있을 수 있습니다.',
            'infrastructure:Redis': '로그인 세션, 캐시 등 Redis 의존 기능에 영향이 있을 수 있습니다.',
            security_probe: '알 수 없는 외부 봇이 서버를 스캔했습니다. 서비스에는 영향이 없습니다.',
        };

        if (descMap[groupKey]) return descMap[groupKey];
        if (category === 'api_error') return 'API 엔드포인트에서 오류가 발생했습니다. 사용자에게 영향이 있을 수 있습니다.';
        return '애플리케이션 내부에서 예상치 못한 오류가 발생했습니다.';
    }

    private determineServiceHealth(groups: IssueGroup[], now: Date): ServiceHealthInfo {
        const kafkaGroup = groups.find((g) => g.groupKey === 'infrastructure:ServerKafka');
        const redisGroup = groups.find((g) => g.groupKey === 'infrastructure:Redis');
        const apiGroup = groups.find((g) => g.category === 'api_error');

        return {
            kafka: this.buildServiceStatus(kafkaGroup, now),
            redis: this.buildServiceStatus(redisGroup, now),
            api: this.buildServiceStatus(apiGroup, now),
        };
    }

    private buildServiceStatus(
        group: IssueGroup | undefined,
        now: Date,
    ): { status: ServiceStatus; lastErrorAt: string | null } {
        if (!group) {
            return { status: 'healthy', lastErrorAt: null };
        }

        const msSinceLast = now.getTime() - new Date(group.lastAt).getTime();
        const status: ServiceStatus =
            msSinceLast < LogCategorizerService.ACTIVE_ERROR_THRESHOLD_MS ? 'error' : 'warning';

        return { status, lastErrorAt: group.lastAt };
    }

    private determineOverallStatus(groups: IssueGroup[]): OverallStatus {
        const hasUnresolvedCritical = groups.some((g) => g.severity === 'critical' && !g.isResolved);
        if (hasUnresolvedCritical) return 'critical';

        const hasUnresolvedWarning = groups.some((g) => g.severity === 'warning' && !g.isResolved);
        if (hasUnresolvedWarning) return 'warning';

        return 'healthy';
    }

    private buildSummary(groups: IssueGroup[]): { critical: number; warning: number; info: number } {
        return {
            critical: groups.filter((g) => g.severity === 'critical' && !g.isResolved).length,
            warning: groups.filter((g) => g.severity === 'warning' && !g.isResolved).length,
            info: groups.filter((g) => g.severity === 'info').length,
        };
    }
}
