import { Body, Delete, Param, Post, Put } from '@nestjs/common';

import { AnnouncementCreateRequestDto } from '../dto/request/announcement-create-request.dto';
import { AnnouncementUpdateRequestDto } from '../dto/request/announcement-update-request.dto';
import { AnnouncementResponseDto } from '../dto/response/announcement-response.dto';
import { CreateAnnouncementUseCase } from './application/use-cases/create-announcement.use-case';
import { DeleteAnnouncementUseCase } from './application/use-cases/delete-announcement.use-case';
import { UpdateAnnouncementUseCase } from './application/use-cases/update-announcement.use-case';
import { AnnouncementAdminProtectedController } from './decorator/announcement-admin-controller.decorator';
import {
    ApiCreateAnnouncementAdminEndpoint,
    ApiDeleteAnnouncementAdminEndpoint,
    ApiUpdateAnnouncementAdminEndpoint,
} from './swagger';

@AnnouncementAdminProtectedController()
export class AnnouncementAdminCommandController {
    constructor(
        private readonly createAnnouncementUseCase: CreateAnnouncementUseCase,
        private readonly updateAnnouncementUseCase: UpdateAnnouncementUseCase,
        private readonly deleteAnnouncementUseCase: DeleteAnnouncementUseCase,
    ) {}

    @Post('announcement')
    @ApiCreateAnnouncementAdminEndpoint()
    async createAnnouncement(@Body() createDto: AnnouncementCreateRequestDto): Promise<AnnouncementResponseDto> {
        return this.createAnnouncementUseCase.execute(createDto);
    }

    @Put('announcement/:announcementId')
    @ApiUpdateAnnouncementAdminEndpoint()
    async updateAnnouncement(
        @Param('announcementId') announcementId: string,
        @Body() updateDto: AnnouncementUpdateRequestDto,
    ): Promise<AnnouncementResponseDto> {
        return this.updateAnnouncementUseCase.execute(announcementId, updateDto);
    }

    @Delete('announcement/:announcementId')
    @ApiDeleteAnnouncementAdminEndpoint()
    async deleteAnnouncement(@Param('announcementId') announcementId: string): Promise<void> {
        return this.deleteAnnouncementUseCase.execute(announcementId);
    }
}
