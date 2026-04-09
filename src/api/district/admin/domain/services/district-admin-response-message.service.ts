import { Injectable } from '@nestjs/common';

import { DISTRICT_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/district-admin-response-messages';

@Injectable()
export class DistrictAdminResponseMessageService {
    districtDeleted(): string {
        return DISTRICT_ADMIN_RESPONSE_MESSAGE_EXAMPLES.districtDeleted;
    }
}
