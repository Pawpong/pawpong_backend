import { Get } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiEndpoint } from '../../common/decorator/swagger.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetBreederManagementVerificationStatusUseCase } from './application/use-cases/get-breeder-management-verification-status.use-case';
import { BreederManagementProtectedController } from './decorator/breeder-management-protected-controller.decorator';
import { VerificationStatusResponseDto } from './dto/response/verification-status-response.dto';
import { BreederManagementSwaggerDocs } from './swagger';

@BreederManagementProtectedController()
export class BreederManagementVerificationQueryController {
    constructor(
        private readonly getBreederManagementVerificationStatusUseCase: GetBreederManagementVerificationStatusUseCase,
    ) {}

    @Get('verification')
    @ApiEndpoint(BreederManagementSwaggerDocs.verificationStatus)
    async getVerificationStatus(
        @CurrentUser('userId') userId: string,
    ): Promise<ApiResponseDto<VerificationStatusResponseDto>> {
        const result = await this.getBreederManagementVerificationStatusUseCase.execute(userId);
        return ApiResponseDto.success(result, '인증 상태가 조회되었습니다.');
    }
}
