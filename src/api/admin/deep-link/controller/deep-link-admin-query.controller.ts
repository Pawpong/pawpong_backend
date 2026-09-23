import { DEEP_LINK_MESSAGES } from '../../../service/deep-link/constants/deep-link-messages';
import { Get, Query } from '@nestjs/common';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { PaginationRequestDto } from '../../../../common/dto/pagination/pagination-request.dto';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { ListDeepLinksUseCase } from '../application/use-cases/list-deep-links.use-case';
import { DeepLinkAdminController } from '../decorator/deep-link-admin-controller.decorator';
import { ApiListDeepLinks } from '../swagger';

@DeepLinkAdminController()
export class DeepLinkAdminQueryController {
    constructor(private readonly listLinks: ListDeepLinksUseCase) {}
    /** 비활성 링크도 포함한 관리자 목록을 반환한다. */
    @Get()
    @ApiListDeepLinks()
    async list(@Query() query: PaginationRequestDto) {
        const result = await this.listLinks.execute({ page: query.page, limit: query.limit });
        return ApiResponseDto.success(PaginationResponseDto.fromPageResult(result), DEEP_LINK_MESSAGES.listed);
    }
}
