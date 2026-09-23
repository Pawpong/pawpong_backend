import { DEEP_LINK_MESSAGES } from '../../../service/deep-link/constants/deep-link-messages';
import { Body, Delete, HttpCode, Param, Post, Put } from '@nestjs/common';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { CreateDeepLinkUseCase } from '../application/use-cases/create-deep-link.use-case';
import { UpdateDeepLinkUseCase } from '../application/use-cases/update-deep-link.use-case';
import { DeleteDeepLinkUseCase } from '../application/use-cases/delete-deep-link.use-case';
import { DeepLinkAdminController } from '../decorator/deep-link-admin-controller.decorator';
import { DeepLinkCreateRequestDto, DeepLinkUpdateRequestDto } from '../dto/request/deep-link-create-request.dto';
import { ApiSaveDeepLink, ApiDeleteDeepLink } from '../swagger';

@DeepLinkAdminController()
export class DeepLinkAdminCommandController {
    constructor(
        private readonly createLink: CreateDeepLinkUseCase,
        private readonly updateLink: UpdateDeepLinkUseCase,
        private readonly deleteLink: DeleteDeepLinkUseCase,
    ) {}

    /** 공유 링크를 발행한다. */
    @Post()
    @HttpCode(200)
    @ApiSaveDeepLink()
    async create(@Body() body: DeepLinkCreateRequestDto) {
        return ApiResponseDto.success(await this.createLink.execute({ ...body }), DEEP_LINK_MESSAGES.created);
    }

    /** 기존 링크의 메타데이터와 활성 상태를 변경한다. */
    @Put(':id')
    @ApiSaveDeepLink()
    async update(@Param('id') id: string, @Body() body: DeepLinkUpdateRequestDto) {
        return ApiResponseDto.success(await this.updateLink.execute(id, { ...body }), DEEP_LINK_MESSAGES.updated);
    }

    /** 공유 링크를 삭제한다. */
    @Delete(':id')
    @ApiDeleteDeepLink()
    async delete(@Param('id') id: string) {
        await this.deleteLink.execute(id);
        return ApiResponseDto.success(null, DEEP_LINK_MESSAGES.deleted);
    }
}
