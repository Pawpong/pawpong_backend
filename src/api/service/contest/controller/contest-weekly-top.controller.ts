import { Get } from '@nestjs/common';

import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { GetWeeklyTopUseCase } from '../application/use-cases/get-weekly-top.use-case';
import { ContestPublicController } from '../decorator/contest-controller.decorator';
import { ApiGetWeeklyTopEndpoint } from '../swagger/index';

/**
 * 지난주 최종 TOP 3 조회 (홈 화면 명예의 전당 영역 연동용).
 * GET v2/contest/weekly-top
 */
@ContestPublicController()
export class ContestWeeklyTopController {
    constructor(private readonly getWeeklyTopUseCase: GetWeeklyTopUseCase) {}

    @Get('weekly-top')
    @ApiGetWeeklyTopEndpoint()
    async getWeeklyTop(): Promise<ApiResponseDto<unknown>> {
        const result = await this.getWeeklyTopUseCase.execute();
        return ApiResponseDto.success(result, '지난주 TOP 3 조회 완료');
    }
}
