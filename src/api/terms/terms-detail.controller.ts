import { Controller, Get, Param } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import type { TermsCode } from '../../schema/terms.schema';
import { GetActiveTermByCodeUseCase } from './application/use-cases/get-active-term-by-code.use-case';
import { TERMS_RESPONSE_MESSAGE_EXAMPLES } from './constants/terms-response-messages';
import { TermsResponseDto } from './dto/response/terms-response.dto';
import { ApiGetActiveTermByCodeEndpoint, ApiTermsController } from './swagger';

/**
 * 약관 상세 컨트롤러 (공개)
 * "자세히 보기"에서 호출되는 약관 본문 조회 API
 */
@ApiTermsController()
@Controller('terms')
export class TermsDetailController {
    constructor(private readonly getActiveTermByCodeUseCase: GetActiveTermByCodeUseCase) {}

    @Get(':code')
    @ApiGetActiveTermByCodeEndpoint()
    async getActiveTermByCode(@Param('code') code: TermsCode): Promise<ApiResponseDto<TermsResponseDto>> {
        const result = await this.getActiveTermByCodeUseCase.execute(code);
        return ApiResponseDto.success(result, TERMS_RESPONSE_MESSAGE_EXAMPLES.activeTermDetailRetrieved);
    }
}
