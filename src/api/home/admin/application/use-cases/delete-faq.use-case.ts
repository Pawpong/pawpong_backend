import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { HOME_ADMIN_MANAGER_PORT, type HomeAdminManagerPort } from '../ports/home-admin-manager.port';

@Injectable()
export class DeleteFaqUseCase {
    constructor(
        @Inject(HOME_ADMIN_MANAGER_PORT)
        private readonly homeAdminManager: HomeAdminManagerPort,
    ) {}

    async execute(faqId: string): Promise<void> {
        const deleted = await this.homeAdminManager.deleteFaq(faqId);

        if (!deleted) {
            throw new BadRequestException('FAQ를 찾을 수 없습니다.');
        }
    }
}
