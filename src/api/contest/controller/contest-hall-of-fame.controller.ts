import { Get, Query } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetHallOfFameUseCase } from '../application/use-cases/get-hall-of-fame.use-case';
import { ContestPublicController } from '../decorator/contest-controller.decorator';
import { ApiGetHallOfFameEndpoint } from '../swagger';

/**
 * 역대 명예의 전당 목록 (Figma 715:62770).
 * GET v2/contest/hall-of-fame?page=1&limit=10
 */
@ContestPublicController()
export class ContestHallOfFameController {
    constructor(private readonly getHallOfFameUseCase: GetHallOfFameUseCase) {}

    @Get('hall-of-fame')
    @ApiGetHallOfFameEndpoint()
    async getHallOfFame(@Query('page') page = 1, @Query('limit') limit = 10): Promise<ApiResponseDto<unknown>> {
        const result = await this.getHallOfFameUseCase.execute({ page: Number(page), limit: Number(limit) });
        return ApiResponseDto.success(result, '명예의 전당 조회 완료');
    }
}
