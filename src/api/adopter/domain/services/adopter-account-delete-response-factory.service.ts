import { Injectable } from '@nestjs/common';

import type { AdopterAccountDeleteResult } from '../../application/types/adopter-result.type';

@Injectable()
export class AdopterAccountDeleteResponseFactoryService {
    create(userId: string, deletedAt: Date): AdopterAccountDeleteResult {
        return {
            adopterId: userId,
            deletedAt: deletedAt.toISOString(),
            message: '회원 탈퇴가 성공적으로 처리되었습니다.',
        };
    }
}
