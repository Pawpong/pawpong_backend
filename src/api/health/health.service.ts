import { Injectable } from '@nestjs/common';
import { HealthCheckResponseDto } from './dto/response/health-check-response.dto';

@Injectable()
export class HealthService {
    /**
     * 시스템 헬스체크 데이터 조회
     * 시스템 상태 정보를 반환합니다.
     */
    getHealth(): HealthCheckResponseDto {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'Pawpong Backend',
            version: '1.0.0-MVP',
            environment: process.env.NODE_ENV || 'development',
            uptime: Math.floor(process.uptime()),
        };
    }
}
