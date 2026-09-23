import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Adopter, AdopterSchema } from '../../schema/adopter.schema';
import { Breeder, BreederSchema } from '../../schema/breeder.schema';
import { PushDevice, PushDeviceSchema } from '../../schema/push-device.schema';
import { AccountAccessRevocationListener } from './account-access-revocation.listener';
import { AccountAccessRepository } from './repository/account-access.repository';

/** 도메인 간 직접 주입 없이 계정 접근 폐기 이벤트를 처리한다. */
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Adopter.name, schema: AdopterSchema },
            { name: Breeder.name, schema: BreederSchema },
            { name: PushDevice.name, schema: PushDeviceSchema },
        ]),
    ],
    providers: [AccountAccessRevocationListener, AccountAccessRepository],
})
export class AccountAccessModule {}
