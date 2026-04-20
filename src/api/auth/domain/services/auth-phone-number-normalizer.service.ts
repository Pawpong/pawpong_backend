import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthPhoneNumberNormalizerService {
    normalize(phone?: string): string | undefined {
        if (!phone) {
            return undefined;
        }

        return phone.replace(/[^0-9]/g, '');
    }
}
