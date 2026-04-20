import { ApiProperty } from '@nestjs/swagger';

import type {
    IssueCategory,
    IssueSeverity,
    OverallStatus,
    ServiceStatus,
} from '../../domain/services/log-categorizer.service';

export class ServiceStatusDto {
    @ApiProperty({ description: '서비스 상태', enum: ['healthy', 'warning', 'error', 'unknown'], example: 'healthy' })
    status: ServiceStatus;

    @ApiProperty({ description: '마지막 에러 발생 시각 (없으면 null)', example: '2026-04-12T11:54:07.000Z', nullable: true })
    lastErrorAt: string | null;
}

export class ServicesHealthDto {
    @ApiProperty({ description: '채팅 서버 (Kafka) 상태', type: ServiceStatusDto })
    kafka: ServiceStatusDto;

    @ApiProperty({ description: 'Redis 캐시 서버 상태', type: ServiceStatusDto })
    redis: ServiceStatusDto;

    @ApiProperty({ description: 'API 서버 상태', type: ServiceStatusDto })
    api: ServiceStatusDto;
}

export class HealthSummaryDto {
    @ApiProperty({ description: '미해결 심각(critical) 이슈 수', example: 0 })
    critical: number;

    @ApiProperty({ description: '미해결 경고(warning) 이슈 수', example: 1 })
    warning: number;

    @ApiProperty({ description: '정보성(info) 이슈 수 (봇 스캔 등)', example: 2 })
    info: number;
}

export class IssueGroupDto {
    @ApiProperty({ description: '이슈 카테고리', enum: ['infrastructure', 'api_error', 'security_probe', 'application'], example: 'infrastructure' })
    category: IssueCategory;

    @ApiProperty({ description: '심각도', enum: ['critical', 'warning', 'info'], example: 'critical' })
    severity: IssueSeverity;

    @ApiProperty({ description: 'PM용 제목 (한국어)', example: '채팅 서버 (Kafka) 연결 오류' })
    title: string;

    @ApiProperty({ description: 'PM용 설명 (한국어)', example: '채팅 메시지 전송에 영향이 있을 수 있습니다.' })
    description: string;

    @ApiProperty({ description: '발생 횟수', example: 28 })
    count: number;

    @ApiProperty({ description: '최초 발생 시각 (ISO 8601)', example: '2026-04-12T10:05:08.000Z' })
    firstAt: string;

    @ApiProperty({ description: '최근 발생 시각 (ISO 8601)', example: '2026-04-12T11:54:07.000Z' })
    lastAt: string;

    @ApiProperty({ description: '해결 여부 (30분 이상 재발 없으면 true)', example: true })
    isResolved: boolean;
}

/**
 * 시스템 헬스 응답 DTO
 */
export class SystemHealthResponseDto {
    @ApiProperty({ description: '전체 시스템 상태', enum: ['healthy', 'warning', 'critical'], example: 'warning' })
    overallStatus: OverallStatus;

    @ApiProperty({ description: '응답 생성 시각 (ISO 8601)', example: '2026-04-14T05:08:50.000Z' })
    asOf: string;

    @ApiProperty({ description: '조회 기간', example: { from: '2026-04-13T05:08:50.000Z', to: '2026-04-14T05:08:50.000Z' } })
    period: { from: string; to: string };

    @ApiProperty({ description: '서비스별 상태', type: ServicesHealthDto })
    services: ServicesHealthDto;

    @ApiProperty({ description: '심각도별 건수 요약', type: HealthSummaryDto })
    summary: HealthSummaryDto;

    @ApiProperty({ description: '이슈 그룹 목록 (최신순)', type: [IssueGroupDto] })
    issueGroups: IssueGroupDto[];
}
