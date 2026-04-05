import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class AuthSocialIdentityService {
    parseRequiredTempId(tempId: string): { provider: string; providerId: string } {
        const tempIdParts = tempId.split('_');
        if (tempIdParts.length < 4 || tempIdParts[0] !== 'temp') {
            throw new BadRequestException('유효하지 않은 임시 ID 형식입니다.');
        }

        return {
            provider: tempIdParts[1],
            providerId: tempIdParts.slice(2, -1).join('_'),
        };
    }

    parseOptionalSocialAuthInfo(
        tempId: string | undefined,
        provider: string | undefined,
        email: string,
    ):
        | {
              authProvider: string;
              providerUserId: string;
              providerEmail: string;
          }
        | undefined {
        if (!tempId || !provider) {
            return undefined;
        }

        const parsed = this.parseRequiredTempId(tempId);

        return {
            authProvider: parsed.provider,
            providerUserId: parsed.providerId,
            providerEmail: email,
        };
    }
}
