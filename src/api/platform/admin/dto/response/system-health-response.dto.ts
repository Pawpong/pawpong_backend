import { ApiProperty } from '@nestjs/swagger';

import type {
    IssueCategory,
    IssueSeverity,
    OverallStatus,
    ServiceStatus,
} from '../../domain/services/log-categorizer.service';

/**
 * 단일 서비스 상태 DTO
 */
export class ServiceStatusDto {
    /**
     * 서비스 상태
     * @example "healthy"
     */
    @ApiProperty({
        description: '서비스 상태',
        enum: ['healthy', 'warning', 'error', 'unknown'],
        example: 'healthy',
    })
    status: ServiceStatus;

    /**
     * 마지막 에러 발생 시각 (없으면 null)
     * @example "2026-04-12T11:54:07.000Z"
     */
    @ApiProperty({
        description: '마지막 에러 발생 시각 (없으면 null)',
        example: '2026-04-12T11:54:07.000Z',
        nullable: true,
    })
    lastErrorAt: string | null;
}

/**
 * 서비스별 상태 현황 DTO
 */
export class ServicesHealthDto {
    @ApiProperty({ description: '채팅 서버 (Kafka) 상태', type: ServiceStatusDto })
    kafka: ServiceStatusDto;

    @ApiProperty({ description: 'Redis 캐시 서버 상태', type: ServiceStatusDto })
    redis: ServiceStatusDto;

    @ApiProperty({ description: 'API 서버 상태', type: ServiceStatusDto })
    api: ServiceStatusDto;
}

/**
 * 심각도별 이슈 건수 요약 DTO
 */
export class HealthSummaryDto {
    /**
     * 미해결 심각 이슈 수
     * @example 0
     */
    @ApiProperty({ description: '미해결 심각(critical) 이슈 수', example: 0 })
    critical: number;

    /**
     * 미해결 경고 이슈 수
     * @example 1
     */
    @ApiProperty({ description: '미해결 경고(warning) 이슈 수', example: 1 })
    warning: number;

    /**
     * 정보성 이슈 수 (봇 스캔 등)
     * @example 2
     */
    @ApiProperty({ description: '정보성(info) 이슈 수 (봇 스캔 등)', example: 2 })
    info: number;
}

/**
 * 이슈 그룹 DTO — PM이 읽는 단위
 */
export class IssueGroupDto {
    /**
     * 이슈 카테고리
     * @example "infrastructure"
     */
    @ApiProperty({
        description: '이슈 카테고리',
        enum: ['infrastructure', 'api_error', 'security_probe', 'application'],
        example: 'infrastructure',
    })
    category: IssueCategory;

    /**
     * 심각도
     * @example "critical"
     */
    @ApiProperty({
        description: '심각도',
        enum: ['critical', 'warning', 'info'],
        example: 'critical',
    })
    severity: IssueSeverity;

    /**
     * PM용 한국어 제목
     * @example "채팅 서버 (Kafka) 연결 오류"
     */
    @ApiProperty({ description: 'PM용 제목 (한국어)', example: '채팅 서버 (Kafka) 연결 오류' })
    title: string;

    /**
     * PM용 한국어 설명
     * @example "채팅 메시지 전송에 영향이 있을 수 있습니다."
     */
    @ApiProperty({
        description: 'PM용 설명 (한국어)',
        example: '채팅 메시지 전송에 영향이 있을 수 있습니다.',
    })
    description: string;

    /**
     * 발생 횟수
     * @example 28
     */
    @ApiProperty({ description: '발생 횟수', example: 28 })
    count: number;

    /**
     * 최초 발생 시각
     * @example "2026-04-12T10:05:08.000Z"
     */
    @ApiProperty({ description: '최초 발생 시각 (ISO 8601)', example: '2026-04-12T10:05:08.000Z' })
    firstAt: string;

    /**
     * 최근 발생 시각
     * @example "2026-04-12T11:54:07.000Z"
     */
    @ApiProperty({ description: '최근 발생 시각 (ISO 8601)', example: '2026-04-12T11:54:07.000Z' })
    lastAt: string;

    /**
     * 해결 여부 (30분 이상 재발 없으면 true)
     * @example true
     */
    @ApiProperty({ description: '해결 여부 (30분 이상 재발 없으면 true)', example: true })
    isResolved: boolean;
}

/**
 * 시스템 헬스 응답 DTO
 *
 * 관리자 대시보드의 "서버 현황" 페이지에서 사용됩니다.
 */
export class SystemHealthResponseDto {
    /**
     * 전체 시스템 상태
     * @example "warning"
     */
    @ApiProperty({
        description: '전체 시스템 상태 (healthy | warning | critical)',
        enum: ['healthy', 'warning', 'critical'],
        example: 'warning',
    })
    overallStatus: OverallStatus;

    /**
     * 응답 생성 시각
     * @example "2026-04-14T05:08:50.000Z"
     */
    @ApiProperty({ description: '응답 생성 시각 (ISO 8601)', example: '2026-04-14T05:08:50.000Z' })
    asOf: string;

    /**
     * 조회 기간
     */
    @ApiProperty({
        description: '조회 기간',
        example: { from: '2026-04-13T05:08:50.000Z', to: '2026-04-14T05:08:50.000Z' },
    })
    period: { from: string; to: string };

    /**
     * 서비스별 상태
     */
    @ApiProperty({ description: '서비스별 상태', type: ServicesHealthDto })
    services: ServicesHealthDto;

    /**
     * 심각도별 건수 요약
     */
    @ApiProperty({ description: '심각도별 건수 요약', type: HealthSummaryDto })
    summary: HealthSummaryDto;

    /**
     * 이슈 그룹 목록 (최신순)
     */
    @ApiProperty({ description: '이슈 그룹 목록 (최신순)', type: [IssueGroupDto] })
    issueGroups: IssueGroupDto[];
}
