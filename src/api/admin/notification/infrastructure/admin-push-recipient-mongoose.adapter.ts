import { Injectable } from '@nestjs/common';

import type { AdminPushRecipientReaderPort } from '../application/ports/admin-push-recipient-reader.port';
import type { AdminPushRecipientSnapshot, AdminPushTarget } from '../application/types/admin-push.type';
import { AdminPushRecipientRepository } from '../repository/admin-push-recipient.repository';

@Injectable()
export class AdminPushRecipientMongooseAdapter implements AdminPushRecipientReaderPort {
    constructor(private readonly repository: AdminPushRecipientRepository) {}

    async readRecipients(target: AdminPushTarget): Promise<AdminPushRecipientSnapshot[]> {
        if (target.type === 'all_adopters') return this.repository.listAdopters();
        if (target.type === 'all_breeders') return this.repository.listBreeders();
        const one =
            target.role === 'adopter'
                ? await this.repository.findOneAdopter(target.userId)
                : await this.repository.findOneBreeder(target.userId);
        return one ? [one] : [];
    }
}
