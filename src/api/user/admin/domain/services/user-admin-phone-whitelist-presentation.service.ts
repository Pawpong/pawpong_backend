import { Injectable } from '@nestjs/common';

import { PhoneWhitelistListResponseDto, PhoneWhitelistResponseDto } from '../../dto/response/phone-whitelist-response.dto';
import { UserAdminPhoneWhitelistSnapshot } from '../../application/ports/user-admin-reader.port';

@Injectable()
export class UserAdminPhoneWhitelistPresentationService {
    toPhoneWhitelistListResponse(items: UserAdminPhoneWhitelistSnapshot[]): PhoneWhitelistListResponseDto {
        return {
            items: items.map((item) => this.toPhoneWhitelistResponse(item)),
            total: items.length,
        };
    }

    toPhoneWhitelistResponse(item: UserAdminPhoneWhitelistSnapshot): PhoneWhitelistResponseDto {
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
