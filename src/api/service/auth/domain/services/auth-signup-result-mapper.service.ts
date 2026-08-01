import { Injectable } from '@nestjs/common';

import type {
    RegisterAdopterAuthSignupResult,
    RegisterBreederAuthSignupResult,
} from '../../application/types/auth-signup.type';
import type { AuthRegistrationRecord } from '../../types/auth-record.type';

type AuthSignupTokenPair = {
    accessToken: string;
    refreshToken: string;
};

@Injectable()
export class AuthSignupResultMapperService {
    toAdopterResult(
        savedAdopter: AuthRegistrationRecord,
        tokens: AuthSignupTokenPair,
    ): RegisterAdopterAuthSignupResult {
        return {
            adopterId: savedAdopter._id.toString(),
            email: savedAdopter.emailAddress,
            nickname: savedAdopter.nickname || '',
            phoneNumber: savedAdopter.phoneNumber || '',
            profileImage: savedAdopter.profileImageFileName || '',
            userRole: 'adopter',
            accountStatus: savedAdopter.accountStatus,
            createdAt: savedAdopter.createdAt?.toISOString() || new Date().toISOString(),
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    toBreederResult(
        savedBreeder: AuthRegistrationRecord,
        tokens: AuthSignupTokenPair,
    ): RegisterBreederAuthSignupResult {
        return {
            breederId: savedBreeder._id.toString(),
            email: savedBreeder.emailAddress,
            breederName: savedBreeder.name || savedBreeder.nickname || '',
            breederLocation: this.formatBreederLocation(
                savedBreeder.profile?.location?.city || '',
                savedBreeder.profile?.location?.district,
            ),
            animal: savedBreeder.petType || '',
            breeds: savedBreeder.breeds || [],
            plan: savedBreeder.verification?.plan || '',
            level: savedBreeder.verification?.level || '',
            verificationStatus: savedBreeder.verification?.status || '',
            createdAt: savedBreeder.createdAt?.toISOString() || new Date().toISOString(),
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    private formatBreederLocation(city: string, district?: string): string {
        return `${city} ${district || ''}`.trim();
    }
}
