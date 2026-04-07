import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Adopter, AdopterDocument } from '../../../schema/adopter.schema';
import { Breeder, BreederDocument } from '../../../schema/breeder.schema';
import { PhoneWhitelist, PhoneWhitelistDocument } from '../../../schema/phone-whitelist.schema';
import { AuthPhoneVerificationRegistryPort } from '../application/ports/auth-phone-verification-registry.port';

@Injectable()
export class AuthPhoneVerificationMongooseRegistryAdapter implements AuthPhoneVerificationRegistryPort {
    constructor(
        @InjectModel(Adopter.name) private readonly adopterModel: Model<AdopterDocument>,
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
        @InjectModel(PhoneWhitelist.name) private readonly phoneWhitelistModel: Model<PhoneWhitelistDocument>,
    ) {}

    async isPhoneWhitelisted(phoneNumber: string): Promise<boolean> {
        const whitelist = await this.phoneWhitelistModel.exists({ phoneNumber, isActive: true }).exec();
        return !!whitelist;
    }

    async hasRegisteredPhone(phoneNumber: string): Promise<boolean> {
        const [adopter, breeder] = await Promise.all([
            this.adopterModel.exists({ phoneNumber }).exec(),
            this.breederModel.exists({ $or: [{ phoneNumber }, { phone: phoneNumber }] } as any).exec(),
        ]);

        return !!adopter || !!breeder;
    }
}
