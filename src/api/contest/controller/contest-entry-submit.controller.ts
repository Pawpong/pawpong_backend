import { BadRequestException, Body, Post } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { SubmitContestEntryUseCase } from '../application/use-cases/submit-contest-entry.use-case';
import { ContestProtectedController } from '../decorator/contest-controller.decorator';
import { SubmitContestEntryRequestDto } from '../dto/request/submit-contest-entry-request.dto';
import { ApiSubmitContestEntryEndpoint } from '../swagger';

/**
 * 콘테스트 참여 (Figma 350:2356 콘테스트 참여 모달).
 * POST v2/contest/entry
 */
@ContestProtectedController()
export class ContestEntrySubmitController {
    constructor(private readonly submitContestEntryUseCase: SubmitContestEntryUseCase) {}

    @Post('entry')
    @ApiSubmitContestEntryEndpoint()
    async submit(
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') role: string,
        @Body() dto: SubmitContestEntryRequestDto,
    ): Promise<ApiResponseDto<unknown>> {
        if (role !== 'adopter' && role !== 'breeder') {
            throw new BadRequestException('지원하지 않는 역할입니다.');
        }
        const result = await this.submitContestEntryUseCase.execute({
            userId,
            role,
            photoFileName: dto.photoFileName,
            description: dto.description,
        });
        return ApiResponseDto.success(result, '콘테스트 참여가 완료되었습니다.');
    }
}
