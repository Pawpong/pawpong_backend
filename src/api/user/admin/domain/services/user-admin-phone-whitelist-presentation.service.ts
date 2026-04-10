import { Injectable } from '@nestjs/common';

import { UserAdminPhoneWhitelistSnapshot } from '../../application/ports/user-admin-reader.port';
import type {
    UserAdminPhoneWhitelistItemResult,
    UserAdminPhoneWhitelistListResult,
} from '../../application/types/user-admin-result.type';

@Injectable()
export class UserAdminPhoneWhitelistPresentationService {
    toPhoneWhitelistListResponse(items: UserAdminPhoneWhitelistSnapshot[]): UserAdminPhoneWhitelistListResult {
        return {
            items: items.map((item) => this.toPhoneWhitelistResponse(item)),
            total: items.length,
        };
    }

    toPhoneWhitelistResponse(item: UserAdminPhoneWhitelistSnapshot): UserAdminPhoneWhitelistItemResult {
        return {
            id: item.id,
            phoneNumber: item.phoneNumber,
            description: item.description,
            isActive: item.isActive,
            createdBy: item.createdBy,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        };
    }
}
