import { Injectable } from '@nestjs/common';

import type { AdopterProfileUpdateRecord } from '../../types/adopter-profile.type';

@Injectable()
export class AdopterProfileUpdateMapperService {
    toRecord(updateData: {
        name?: string;
        phone?: string;
        profileImage?: string;
        marketingConsent?: boolean;
        counselDefaultProfile?: {
            selfIntroduction?: string;
            dailyAbsenceHours?: string;
            livingSpaceDescription?: string;
        };
    }): AdopterProfileUpdateRecord {
        const mappedData: AdopterProfileUpdateRecord = {};

        // 프로필 편집의 'name' 은 표시용 닉네임(nickname)이다. (스키마에 fullName 필드는 존재하지 않음)
        if (updateData.name) mappedData.nickname = updateData.name;
        if (updateData.phone) mappedData.phoneNumber = updateData.phone;
        if (updateData.profileImage) mappedData.profileImageFileName = updateData.profileImage;
        if (typeof updateData.marketingConsent === 'boolean') mappedData.marketingConsent = updateData.marketingConsent;

        // 상담 사전 정보는 넘어온 필드만 점 표기로 갱신해 동의 시각을 보존한다.
        // 빈 문자열도 '지우기'로 인정해야 해서 undefined 여부로만 판단한다.
        const counsel = updateData.counselDefaultProfile;
        if (counsel) {
            if (counsel.selfIntroduction !== undefined)
                mappedData['counselDefaultProfile.selfIntroduction'] = counsel.selfIntroduction;
            if (counsel.dailyAbsenceHours !== undefined)
                mappedData['counselDefaultProfile.dailyAbsenceHours'] = counsel.dailyAbsenceHours;
            if (counsel.livingSpaceDescription !== undefined)
                mappedData['counselDefaultProfile.livingSpaceDescription'] = counsel.livingSpaceDescription;
        }

        return mappedData;
    }
}
