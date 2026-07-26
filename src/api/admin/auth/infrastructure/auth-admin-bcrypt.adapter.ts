import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { AuthAdminPasswordPort } from '../application/ports/auth-admin-password.port';

@Injectable()
export class AuthAdminBcryptAdapter implements AuthAdminPasswordPort {
    compare(plainText: string, passwordHash: string): Promise<boolean> {
        return bcrypt.compare(plainText, passwordHash);
    }
}
