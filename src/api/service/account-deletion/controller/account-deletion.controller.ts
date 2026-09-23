import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guard/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorator/user.decorator';
import { Public } from '../../../../common/decorator/public.decorator';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import {
    RequestAccountDeletionUseCase,
    GetAccountDeletionStatusUseCase,
} from '../application/use-cases/request-account-deletion.use-case';
import { AccountDeletionStatusDto, RequestAccountDeletionDto } from '../dto/account-deletion-request.dto';

@ApiTags('Account deletion')
@Controller('v2/account-deletion')
@UseGuards(JwtAuthGuard)
export class AccountDeletionController {
    constructor(
        private readonly requestDeletion: RequestAccountDeletionUseCase,
        private readonly getStatus: GetAccountDeletionStatusUseCase,
    ) {}
    @Post()
    @HttpCode(202)
    async request(
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') role: string,
        @Body() body: RequestAccountDeletionDto,
    ) {
        return ApiResponseDto.success(
            await this.requestDeletion.execute(userId, role, body.confirmation, {
                requestId: body.requestId,
                receiptToken: body.receiptToken,
            }),
            '영구 삭제를 접수했습니다. 처리 완료 전까지 상태를 확인해주세요.',
        );
    }
    @Public()
    @Post('status')
    @HttpCode(200)
    async status(@Body() body: AccountDeletionStatusDto) {
        return ApiResponseDto.success(
            await this.getStatus.execute(body.requestId, body.receiptToken),
            '삭제 처리 상태입니다.',
        );
    }
}
