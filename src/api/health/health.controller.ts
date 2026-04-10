import { Controller, Get } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetHealthUseCase } from './application/use-cases/get-health.use-case';
import type { HealthResult } from './application/types/health-result.type';
import { HealthResponseMessageService } from './domain/services/health-response-message.service';
import { HealthCheckResponseDto } from './dto/response/health-check-response.dto';
import { ApiGetHealthEndpoint, ApiHealthController } from './swagger';

@ApiHealthController()
@Controller('health')
export class HealthController {
    constructor(
        private readonly getHealthUseCase: GetHealthUseCase,
        private readonly healthResponseMessageService: HealthResponseMessageService,
    ) {}

    @Get()
    @ApiGetHealthEndpoint()
    getHealth(): ApiResponseDto<HealthCheckResponseDto> {
        const healthData = this.getHealthUseCase.execute();
        return ApiResponseDto.success(
            healthData as HealthCheckResponseDto & HealthResult,
            this.healthResponseMessageService.healthChecked(),
        );
    }
}
