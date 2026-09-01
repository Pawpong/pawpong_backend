import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';

import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { GetHealthUseCase } from '../application/use-cases/get-health.use-case';
import { GetReadinessUseCase } from '../application/use-cases/get-readiness.use-case';
import { HEALTH_RESPONSE_MESSAGE_EXAMPLES } from '../constants/health-response-messages';
import { HealthCheckResponseDto } from '../dto/response/health-check-response.dto';
import { ReadinessCheckResponseDto } from '../dto/response/readiness-check-response.dto';
import { ApiGetHealthEndpoint, ApiGetReadinessEndpoint, ApiHealthController } from '../swagger/index';

@ApiHealthController()
@Controller('health')
export class HealthController {
    constructor(
        private readonly getHealthUseCase: GetHealthUseCase,
        private readonly getReadinessUseCase: GetReadinessUseCase,
    ) {}

    @Get()
    @ApiGetHealthEndpoint()
    getHealth(): ApiResponseDto<HealthCheckResponseDto> {
        const healthData = this.getHealthUseCase.execute();
        return ApiResponseDto.success(healthData, HEALTH_RESPONSE_MESSAGE_EXAMPLES.healthChecked);
    }

    @Get('ready')
    @ApiGetReadinessEndpoint()
    async getReadiness(
        @Res({ passthrough: true }) response: Response,
    ): Promise<ApiResponseDto<ReadinessCheckResponseDto>> {
        const readiness = await this.getReadinessUseCase.execute();

        if (readiness.status === 'unhealthy') {
            response.status(HttpStatus.SERVICE_UNAVAILABLE);
            return new ApiResponseDto(
                false,
                HttpStatus.SERVICE_UNAVAILABLE,
                readiness,
                undefined,
                HEALTH_RESPONSE_MESSAGE_EXAMPLES.readinessFailed,
            );
        }

        return ApiResponseDto.success(readiness, HEALTH_RESPONSE_MESSAGE_EXAMPLES.readinessChecked);
    }
}
