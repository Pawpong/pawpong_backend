import { Get } from '@nestjs/common';

import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { GetYesterdayTopUseCase } from '../application/use-cases/get-yesterday-top.use-case';
import { ContestPublicController } from '../decorator/contest-controller.decorator';
import { ApiGetYesterdayTopEndpoint } from '../swagger/index';

/**
 * 어제 기준 TOP 3 조회 (Figma 315:5985 실시간 랭킹).
 * GET v2/contest/yesterday-top
 */
@ContestPublicController()
export class ContestYesterdayTopController {
    constructor(private readonly getYesterdayTopUseCase: GetYesterdayTopUseCase) {}

    @Get('yesterday-top')
    @ApiGetYesterdayTopEndpoint()
    async getYesterdayTop(): Promise<ApiResponseDto<unknown>> {
        const result = await this.getYesterdayTopUseCase.execute();
        return ApiResponseDto.success(result, '어제 기준 TOP 3 조회 완료');
    }
}
