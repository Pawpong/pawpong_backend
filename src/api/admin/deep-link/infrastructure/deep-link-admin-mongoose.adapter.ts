import { Injectable } from '@nestjs/common';
import type { DeepLinkAdminStorePort } from '../application/ports/deep-link-admin-store.port';
import type { DeepLinkValues } from '../../../service/deep-link/application/types/deep-link.type';
import { DeepLinkRepository } from '../../../service/deep-link/repository/deep-link.repository';

@Injectable()
export class DeepLinkAdminMongooseAdapter implements DeepLinkAdminStorePort {
    constructor(private readonly repository: DeepLinkRepository) {}
    /** 관리자 목록 조회를 위임한다. */
    list(page: number, limit: number) {
        return this.repository.list(page, limit);
    }
    /** 관리자 단건 조회를 위임한다. */
    findById(id: string) {
        return this.repository.findById(id);
    }
    /** 생성 명령을 위임한다. */
    create(values: DeepLinkValues) {
        return this.repository.create(values);
    }
    /** 수정 명령을 위임한다. */
    update(id: string, values: DeepLinkValues) {
        return this.repository.update(id, values);
    }
    /** 삭제 명령을 위임한다. */
    delete(id: string) {
        return this.repository.delete(id);
    }
}
