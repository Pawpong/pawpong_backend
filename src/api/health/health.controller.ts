import { Controller, Get } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { HealthCheckResponseDto } from './dto/response/health-check-response.dto';
import { GetHealthUseCase } from './application/use-cases/get-health.use-case';
import { HealthResponseMessageService } from './domain/services/health-response-message.service';
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
        return ApiResponseDto.success(healthData, this.healthResponseMessageService.healthChecked());
    }
}
