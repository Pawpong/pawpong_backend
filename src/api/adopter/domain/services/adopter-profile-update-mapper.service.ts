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

        if (updateData.name) mappedData.fullName = updateData.name;
        if (updateData.phone) mappedData.phoneNumber = updateData.phone;
        if (updateData.profileImage) mappedData.profileImageFileName = updateData.profileImage;
        if (typeof updateData.marketingConsent === 'boolean') mappedData.marketingConsent = updateData.marketingConsent;

        return mappedData;
    }
}
