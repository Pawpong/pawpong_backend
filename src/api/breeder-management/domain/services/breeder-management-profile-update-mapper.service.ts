import { Injectable } from '@nestjs/common';

import { DomainValidationError } from '../../../../common/error/domain.error';
import type { BreederManagementBreederRecord } from '../../application/ports/breeder-management-profile.port';
import type { BreederManagementProfileUpdateCommand } from '../../application/types/breeder-management-profile-command.type';

@Injectable()
export class BreederManagementProfileUpdateMapperService {
    toUpdateData(
        breeder: BreederManagementBreederRecord,
        updateData: BreederManagementProfileUpdateCommand,
    ): Record<string, unknown> {
        const profileUpdateData: Record<string, unknown> = {};

        if (!breeder.profile) {
            profileUpdateData.profile = {};
        }

        if (updateData.profileDescription !== undefined) {
            profileUpdateData['profile.description'] = updateData.profileDescription
                .split('\n')
                .map((line) => line.replace(/^[ \t]+|[ \t]+$/g, ''))
                .join('\n');
        }

        if (updateData.locationInfo) {
            profileUpdateData['profile.location'] = {
                city: updateData.locationInfo.cityName,
                district: updateData.locationInfo.districtName,
                address: updateData.locationInfo.detailAddress || '',
            };
        }

        if (updateData.profilePhotos) {
            if (updateData.profilePhotos.length > 3) {
                throw new DomainValidationError('프로필 사진은 최대 3장까지만 업로드할 수 있습니다.');
            }

            profileUpdateData['profile.representativePhotos'] = updateData.profilePhotos;
        }

        if (updateData.specializationTypes) {
            profileUpdateData['profile.specialization'] = updateData.specializationTypes;
        }

        if (updateData.breeds) {
            profileUpdateData.breeds = updateData.breeds;
        }

        if (updateData.experienceYears !== undefined) {
            profileUpdateData['profile.experienceYears'] = updateData.experienceYears;
        }

        if (updateData.priceRangeInfo) {
            const min = updateData.priceRangeInfo.minimumPrice;
            const max = updateData.priceRangeInfo.maximumPrice;
            const display =
                min === 0 && max === 0 ? updateData.priceRangeInfo.display || 'not_set' : 'range';

            profileUpdateData['profile.priceRange'] = {
                min,
                max,
                display,
            };
        }

        if (updateData.profileImage !== undefined) {
            profileUpdateData.profileImageFileName = updateData.profileImage;
        }

        if (updateData.marketingAgreed !== undefined) {
            profileUpdateData.marketingAgreed = updateData.marketingAgreed;
        }

        if (updateData.consultationAgreed !== undefined) {
            profileUpdateData.consultationAgreed = updateData.consultationAgreed;
        }

        return profileUpdateData;
    }
}
