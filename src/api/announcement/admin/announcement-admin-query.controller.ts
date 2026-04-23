import { Get, Query } from '@nestjs/common';

import { PaginationRequestDto } from '../../../common/dto/pagination/pagination-request.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { GetAllAnnouncementsUseCase } from './application/use-cases/get-all-announcements.use-case';
import type { AnnouncementPageResult } from '../application/types/announcement-result.type';
import { AnnouncementAdminProtectedController } from './decorator/announcement-admin-controller.decorator';
import { AnnouncementResponseDto } from '../dto/response/announcement-response.dto';
import { ApiGetAllAnnouncementsAdminEndpoint } from './swagger';

@AnnouncementAdminProtectedController()
export class AnnouncementAdminQueryController {
    constructor(private readonly getAllAnnouncementsUseCase: GetAllAnnouncementsUseCase) {}

    @Get('announcements')
    @ApiGetAllAnnouncementsAdminEndpoint()
    async getAllAnnouncements(
        @Query() paginationDto: PaginationRequestDto,
    ): Promise<PaginationResponseDto<AnnouncementResponseDto>> {
        const result = await this.getAllAnnouncementsUseCase.execute(paginationDto);
        return PaginationResponseDto.fromPageResult(result);
    }
}
