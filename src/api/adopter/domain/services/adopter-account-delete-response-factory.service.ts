import { Injectable } from '@nestjs/common';

import { AccountDeleteResponseDto } from '../../dto/response/account-delete-response.dto';

@Injectable()
export class AdopterAccountDeleteResponseFactoryService {
    create(userId: string, deletedAt: Date): AccountDeleteResponseDto {
        return {
            adopterId: userId,
            deletedAt: deletedAt.toISOString(),
            message: '회원 탈퇴가 성공적으로 처리되었습니다.',
        };
    }
}
