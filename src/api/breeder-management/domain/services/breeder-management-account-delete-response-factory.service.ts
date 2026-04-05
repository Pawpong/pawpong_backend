import { Injectable } from '@nestjs/common';

@Injectable()
export class BreederManagementAccountDeleteResponseFactoryService {
    create(userId: string, deletedAt: Date) {
        return {
            breederId: userId,
            deletedAt: deletedAt.toISOString(),
            message: '브리더 회원 탈퇴가 성공적으로 처리되었습니다.',
        };
    }
}
