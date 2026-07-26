import { Injectable } from '@nestjs/common';

import type { BreederAdminTestAccountResult } from '../../application/types/breeder-admin-result.type';

@Injectable()
export class BreederAdminTestAccountResultMapperService {
    toResult(
        breederId: string,
        breederName: string,
        isTestAccount: boolean,
        updatedAt: Date,
    ): BreederAdminTestAccountResult {
        return {
            breederId,
            breederName,
            isTestAccount,
            updatedAt,
        };
    }
}
