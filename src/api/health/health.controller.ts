import { Controller, Get } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetHealthUseCase } from './application/use-cases/get-health.use-case';
import type { HealthResult } from './application/types/health-result.type';
import { HEALTH_RESPONSE_MESSAGE_EXAMPLES } from './constants/health-response-messages';
import { HealthCheckResponseDto } from './dto/response/health-check-response.dto';
import { ApiGetHealthEndpoint, ApiHealthController } from './swagger';

@ApiHealthController()
@Controller('health')
export class HealthController {
    constructor(private readonly getHealthUseCase: GetHealthUseCase) {}

    @Get()
    @ApiGetHealthEndpoint()
    getHealth(): ApiResponseDto<HealthCheckResponseDto> {
        const healthData = this.getHealthUseCase.execute();
        return ApiResponseDto.success(
            healthData as HealthCheckResponseDto & HealthResult,
            HEALTH_RESPONSE_MESSAGE_EXAMPLES.healthChecked,
        );
    }
}
