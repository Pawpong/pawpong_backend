import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserAdminController } from './user-admin.controller';
import { GetAdminProfileUseCase } from './application/use-cases/get-admin-profile.use-case';
import { GetUsersUseCase } from './application/use-cases/get-users.use-case';
import { UpdateUserStatusUseCase } from './application/use-cases/update-user-status.use-case';
import { GetDeletedUsersUseCase } from './application/use-cases/get-deleted-users.use-case';
import { GetDeletedUserStatsUseCase } from './application/use-cases/get-deleted-user-stats.use-case';
import { RestoreDeletedUserUseCase } from './application/use-cases/restore-deleted-user.use-case';
import { HardDeleteUserUseCase } from './application/use-cases/hard-delete-user.use-case';
import { GetPhoneWhitelistUseCase } from './application/use-cases/get-phone-whitelist.use-case';
import { AddPhoneWhitelistUseCase } from './application/use-cases/add-phone-whitelist.use-case';
import { UpdatePhoneWhitelistUseCase } from './application/use-cases/update-phone-whitelist.use-case';
import { DeletePhoneWhitelistUseCase } from './application/use-cases/delete-phone-whitelist.use-case';
import { USER_ADMIN_READER } from './application/ports/user-admin-reader.port';
import { USER_ADMIN_WRITER } from './application/ports/user-admin-writer.port';
import { UserAdminCommandPolicyService } from './domain/services/user-admin-command-policy.service';
import { UserAdminPresentationService } from './domain/services/user-admin-presentation.service';
import { UserAdminActivityLogFactoryService } from './domain/services/user-admin-activity-log-factory.service';
import { UserAdminMongooseRepositoryAdapter } from './infrastructure/user-admin-mongoose.repository.adapter';

import { Admin, AdminSchema } from '../../../schema/admin.schema';
import { Breeder, BreederSchema } from '../../../schema/breeder.schema';
import { Adopter, AdopterSchema } from '../../../schema/adopter.schema';
import { PhoneWhitelist, PhoneWhitelistSchema } from '../../../schema/phone-whitelist.schema';

/**
 * 사용자 관리 Admin 모듈
 *
 * 사용자 관리 관련 관리자 기능을 제공합니다:
 * - 관리자 프로필 관리
 * - 통합 사용자 관리 (입양자 + 브리더)
 * - 사용자 상태 변경
 * - 프로필 배너 관리
 * - 전화번호 화이트리스트 관리
 */
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Admin.name, schema: AdminSchema },
            { name: Breeder.name, schema: BreederSchema },
            { name: Adopter.name, schema: AdopterSchema },
            { name: PhoneWhitelist.name, schema: PhoneWhitelistSchema },
        ]),
    ],
    controllers: [UserAdminController],
    providers: [
        GetAdminProfileUseCase,
        GetUsersUseCase,
        UpdateUserStatusUseCase,
        GetDeletedUsersUseCase,
        GetDeletedUserStatsUseCase,
        RestoreDeletedUserUseCase,
        HardDeleteUserUseCase,
        GetPhoneWhitelistUseCase,
        AddPhoneWhitelistUseCase,
        UpdatePhoneWhitelistUseCase,
        DeletePhoneWhitelistUseCase,
        UserAdminCommandPolicyService,
        UserAdminPresentationService,
        UserAdminActivityLogFactoryService,
        UserAdminMongooseRepositoryAdapter,
        {
            provide: USER_ADMIN_READER,
            useExisting: UserAdminMongooseRepositoryAdapter,
        },
        {
            provide: USER_ADMIN_WRITER,
            useExisting: UserAdminMongooseRepositoryAdapter,
        },
    ],
})
export class UserAdminModule {}
