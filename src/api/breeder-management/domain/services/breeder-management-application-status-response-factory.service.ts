import { Injectable } from '@nestjs/common';

@Injectable()
export class BreederManagementApplicationStatusResponseFactoryService {
    createUpdatedResponse() {
        return {
            message: '입양 신청 상태가 성공적으로 업데이트되었습니다.',
        };
    }
}
