import { Injectable } from '@nestjs/common';

import { SetTestAccountResponseDto } from '../../dto/response/set-test-account-response.dto';

@Injectable()
export class BreederAdminTestAccountPresentationService {
    create(
        breederId: string,
        breederName: string,
        isTestAccount: boolean,
        updatedAt: Date,
    ): SetTestAccountResponseDto {
        return {
            breederId,
            breederName,
            isTestAccount,
            updatedAt,
        };
    }
}
