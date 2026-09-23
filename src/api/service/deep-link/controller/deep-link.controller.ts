import { DEEP_LINK_MESSAGES } from '../constants/deep-link-messages';
import { Controller, Get, Header, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { ResolveDeepLinkUseCase } from '../application/use-cases/resolve-deep-link.use-case';
import { ApiResolveDeepLink } from '../swagger';

@ApiTags('공유 링크')
@Controller('v2/deep-links')
export class DeepLinkController {
    constructor(private readonly resolveLink: ResolveDeepLinkUseCase) {}
    /** 공개 조회를 캐시하지 않아 비활성화가 즉시 반영되도록 한다. */
    @Get(':slug')
    @Header('Cache-Control', 'no-store')
    @ApiResolveDeepLink()
    async resolve(@Param('slug') slug: string) {
        return ApiResponseDto.success(await this.resolveLink.execute(slug), DEEP_LINK_MESSAGES.resolved);
    }
}
