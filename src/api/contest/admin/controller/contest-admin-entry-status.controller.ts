import { Body, Param, Patch } from '@nestjs/common';

import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { MongoObjectIdPipe } from '../../../../common/pipe/mongo-object-id.pipe';
import { UpdateContestEntryStatusUseCase } from '../application/use-cases/update-contest-entry-status.use-case';
import { ContestAdminProtectedController } from '../decorator/contest-admin-controller.decorator';
import { UpdateContestEntryStatusRequestDto } from '../dto/request/update-contest-entry-status-request.dto';
import { ApiUpdateContestEntryStatusEndpoint } from '../swagger';

/**
 * 관리자 콘테스트 항목 상태 변경.
 * PATCH contest-admin/entries/:entryId/status
 */
@ContestAdminProtectedController()
export class ContestAdminEntryStatusController {
    constructor(private readonly updateContestEntryStatusUseCase: UpdateContestEntryStatusUseCase) {}

    @Patch('entries/:entryId/status')
    @ApiUpdateContestEntryStatusEndpoint()
    async updateStatus(
        @Param('entryId', new MongoObjectIdPipe('항목')) entryId: string,
        @Body() dto: UpdateContestEntryStatusRequestDto,
    ): Promise<ApiResponseDto<null>> {
        await this.updateContestEntryStatusUseCase.execute(entryId, dto.status);
        return ApiResponseDto.success(null, '항목 상태가 변경되었습니다.');
    }
}
