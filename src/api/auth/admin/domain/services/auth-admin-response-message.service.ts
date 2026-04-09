import { Injectable } from '@nestjs/common';

import { AUTH_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/auth-admin-response-messages';

@Injectable()
export class AuthAdminResponseMessageService {
    adminLoginCompleted(): string {
        return AUTH_ADMIN_RESPONSE_MESSAGE_EXAMPLES.adminLoginCompleted;
    }

    adminTokenRefreshed(): string {
        return AUTH_ADMIN_RESPONSE_MESSAGE_EXAMPLES.adminTokenRefreshed;
    }
}
