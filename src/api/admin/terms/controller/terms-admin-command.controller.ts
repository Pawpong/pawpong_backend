import { Body, Delete, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';

import { CurrentUser } from '../../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { MongoObjectIdPipe } from '../../../../common/pipe/mongo-object-id.pipe';
import { ActivateTermsUseCase } from '../application/use-cases/activate-terms.use-case';
import { CreateTermsUseCase } from '../application/use-cases/create-terms.use-case';
import { DeleteTermsUseCase } from '../application/use-cases/delete-terms.use-case';
import { UpdateTermsUseCase } from '../application/use-cases/update-terms.use-case';
import { TermsAdminProtectedController } from '../decorator/terms-admin-controller.decorator';
import { TERMS_RESPONSE_MESSAGE_EXAMPLES } from '../../../service/terms/constants/terms-response-messages';
import { TermsCreateRequestDto } from '../../../service/terms/dto/request/terms-create-request.dto';
import { TermsUpdateRequestDto } from '../../../service/terms/dto/request/terms-update-request.dto';
import { TermsResponseDto } from '../../../service/terms/dto/response/terms-response.dto';
import {
    ApiActivateTermsAdminEndpoint,
    ApiCreateTermsAdminEndpoint,
    ApiDeleteTermsAdminEndpoint,
    ApiUpdateTermsAdminEndpoint,
} from '../swagger/index';

@TermsAdminProtectedController()
export class TermsAdminCommandController {
    constructor(
        private readonly createTermsUseCase: CreateTermsUseCase,
        private readonly updateTermsUseCase: UpdateTermsUseCase,
        private readonly activateTermsUseCase: ActivateTermsUseCase,
        private readonly deleteTermsUseCase: DeleteTermsUseCase,
    ) {}

    @Post()
    @HttpCode(HttpStatus.OK)
    @ApiCreateTermsAdminEndpoint()
    async createTerms(
        @CurrentUser('userId') adminId: string,
        @Body() createData: TermsCreateRequestDto,
    ): Promise<ApiResponseDto<TermsResponseDto>> {
        const result = await this.createTermsUseCase.execute(adminId, createData);
        return ApiResponseDto.success(result, TERMS_RESPONSE_MESSAGE_EXAMPLES.termsCreated);
    }

    @Patch(':termsId')
    @ApiUpdateTermsAdminEndpoint()
    async updateTerms(
        @CurrentUser('userId') adminId: string,
        @Param('termsId', new MongoObjectIdPipe('약관', '올바르지 않은 약관 ID 형식입니다.')) termsId: string,
        @Body() updateData: TermsUpdateRequestDto,
    ): Promise<ApiResponseDto<TermsResponseDto>> {
        const result = await this.updateTermsUseCase.execute(termsId, adminId, updateData);
        return ApiResponseDto.success(result, TERMS_RESPONSE_MESSAGE_EXAMPLES.termsUpdated);
    }

    @Patch(':termsId/activate')
    @ApiActivateTermsAdminEndpoint()
    async activateTerms(
        @CurrentUser('userId') adminId: string,
        @Param('termsId', new MongoObjectIdPipe('약관', '올바르지 않은 약관 ID 형식입니다.')) termsId: string,
    ): Promise<ApiResponseDto<TermsResponseDto>> {
        const result = await this.activateTermsUseCase.execute(termsId, adminId);
        return ApiResponseDto.success(result, TERMS_RESPONSE_MESSAGE_EXAMPLES.termsActivated);
    }

    @Delete(':termsId')
    @ApiDeleteTermsAdminEndpoint()
    async deleteTerms(
        @CurrentUser('userId') adminId: string,
        @Param('termsId', new MongoObjectIdPipe('약관', '올바르지 않은 약관 ID 형식입니다.')) termsId: string,
    ): Promise<ApiResponseDto<null>> {
        await this.deleteTermsUseCase.execute(termsId, adminId);
        return ApiResponseDto.success(null, TERMS_RESPONSE_MESSAGE_EXAMPLES.termsDeleted);
    }
}
