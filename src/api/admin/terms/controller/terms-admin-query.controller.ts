import { Get, Param } from '@nestjs/common';

import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { MongoObjectIdPipe } from '../../../../common/pipe/mongo-object-id.pipe';
import { GetTermsDetailAdminUseCase } from '../application/use-cases/get-terms-detail-admin.use-case';
import { GetTermsListAdminUseCase } from '../application/use-cases/get-terms-list-admin.use-case';
import { TermsAdminProtectedController } from '../decorator/terms-admin-controller.decorator';
import { TERMS_RESPONSE_MESSAGE_EXAMPLES } from '../../../service/terms/constants/terms-response-messages';
import { TermsResponseDto } from '../../../service/terms/dto/response/terms-response.dto';
import { ApiGetTermsDetailAdminEndpoint, ApiGetTermsListAdminEndpoint } from '../swagger/index';

@TermsAdminProtectedController()
export class TermsAdminQueryController {
    constructor(
        private readonly getTermsListAdminUseCase: GetTermsListAdminUseCase,
        private readonly getTermsDetailAdminUseCase: GetTermsDetailAdminUseCase,
    ) {}

    @Get()
    @ApiGetTermsListAdminEndpoint()
    async getTermsListAdmin(): Promise<ApiResponseDto<TermsResponseDto[]>> {
        const result = await this.getTermsListAdminUseCase.execute();
        return ApiResponseDto.success(result, TERMS_RESPONSE_MESSAGE_EXAMPLES.termsListRetrieved);
    }

    @Get(':termsId')
    @ApiGetTermsDetailAdminEndpoint()
    async getTermsDetailAdmin(
        @Param('termsId', new MongoObjectIdPipe('약관', '올바르지 않은 약관 ID 형식입니다.')) termsId: string,
    ): Promise<ApiResponseDto<TermsResponseDto>> {
        const result = await this.getTermsDetailAdminUseCase.execute(termsId);
        return ApiResponseDto.success(result, TERMS_RESPONSE_MESSAGE_EXAMPLES.termsDetailRetrieved);
    }
}
