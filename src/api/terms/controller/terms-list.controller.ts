import { Controller, Get } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetActiveTermsListUseCase } from '../application/use-cases/get-active-terms-list.use-case';
import { TERMS_RESPONSE_MESSAGE_EXAMPLES } from '../constants/terms-response-messages';
import { TermsResponseDto } from '../dto/response/terms-response.dto';
import { ApiGetActiveTermsListEndpoint, ApiTermsController } from '../swagger';

/**
 * 약관 목록 컨트롤러 (공개)
 * 가입/온보딩 화면에서 동의받을 활성 약관 목록을 반환
 */
@ApiTermsController()
@Controller('v2/terms')
export class TermsListController {
    constructor(private readonly getActiveTermsListUseCase: GetActiveTermsListUseCase) {}

    @Get()
    @ApiGetActiveTermsListEndpoint()
    async getActiveTermsList(): Promise<ApiResponseDto<TermsResponseDto[]>> {
        const result = await this.getActiveTermsListUseCase.execute();
        return ApiResponseDto.success(result, TERMS_RESPONSE_MESSAGE_EXAMPLES.activeTermsListRetrieved);
    }
}
