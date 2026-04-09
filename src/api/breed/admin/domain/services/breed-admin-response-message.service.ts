import { Injectable } from '@nestjs/common';

import { BREED_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/breed-admin-response-messages';

@Injectable()
export class BreedAdminResponseMessageService {
    breedDeleted(): string {
        return BREED_ADMIN_RESPONSE_MESSAGE_EXAMPLES.breedDeleted;
    }
}
