import { Injectable } from '@nestjs/common';

import type { AdopterProfileUpdateRecord } from '../../types/adopter-profile.type';

@Injectable()
export class AdopterProfileUpdateMapperService {
    toRecord(updateData: {
        name?: string;
        phone?: string;
        profileImage?: string;
        marketingConsent?: boolean;
    }): AdopterProfileUpdateRecord {
        const mappedData: AdopterProfileUpdateRecord = {};

        // 프로필 편집의 'name' 은 표시용 닉네임(nickname)이다. (스키마에 fullName 필드는 존재하지 않음)
        if (updateData.name) mappedData.nickname = updateData.name;
        if (updateData.phone) mappedData.phoneNumber = updateData.phone;
        if (updateData.profileImage) mappedData.profileImageFileName = updateData.profileImage;
        if (typeof updateData.marketingConsent === 'boolean') mappedData.marketingConsent = updateData.marketingConsent;

        return mappedData;
    }
}
