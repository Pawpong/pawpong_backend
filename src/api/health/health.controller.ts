import { Controller, Get } from '@nestjs/common';

import { ApiController, ApiEndpoint } from '../../common/decorator/swagger.decorator';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { HealthCheckResponseDto } from './dto/response/health-check-response.dto';
import { GetHealthUseCase } from './application/use-cases/get-health.use-case';

@ApiController('시스템')
@Controller('health')
export class HealthController {
    constructor(private readonly getHealthUseCase: GetHealthUseCase) {}

    @Get()
    @ApiEndpoint({
        summary: '헬스체크',
        description: '시스템 상태를 확인합니다.',
        responseType: HealthCheckResponseDto,
        isPublic: true,
    })
    getHealth(): ApiResponseDto<HealthCheckResponseDto> {
        const healthData = this.getHealthUseCase.execute();
        return ApiResponseDto.success(healthData, '시스템이 정상 작동 중입니다.');
    }
}
