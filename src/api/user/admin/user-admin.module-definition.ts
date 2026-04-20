import { MongooseModule } from '@nestjs/mongoose';

import { Adopter, AdopterSchema } from '../../../schema/adopter.schema';
import { Admin, AdminSchema } from '../../../schema/admin.schema';
import { Breeder, BreederSchema } from '../../../schema/breeder.schema';
import { PhoneWhitelist, PhoneWhitelistSchema } from '../../../schema/phone-whitelist.schema';

import { USER_ADMIN_READER_PORT } from './application/ports/user-admin-reader.port';
import { USER_ADMIN_WRITER_PORT } from './application/ports/user-admin-writer.port';
import { AddPhoneWhitelistUseCase } from './application/use-cases/add-phone-whitelist.use-case';
import { DeletePhoneWhitelistUseCase } from './application/use-cases/delete-phone-whitelist.use-case';
import { GetAdminProfileUseCase } from './application/use-cases/get-admin-profile.use-case';
import { GetDeletedUserStatsUseCase } from './application/use-cases/get-deleted-user-stats.use-case';
import { GetDeletedUsersUseCase } from './application/use-cases/get-deleted-users.use-case';
import { GetPhoneWhitelistUseCase } from './application/use-cases/get-phone-whitelist.use-case';
import { GetUsersUseCase } from './application/use-cases/get-users.use-case';
import { HardDeleteUserUseCase } from './application/use-cases/hard-delete-user.use-case';
import { RestoreDeletedUserUseCase } from './application/use-cases/restore-deleted-user.use-case';
import { UpdatePhoneWhitelistUseCase } from './application/use-cases/update-phone-whitelist.use-case';
import { UpdateUserStatusUseCase } from './application/use-cases/update-user-status.use-case';
import { UserAdminActivityLogFactoryService } from './domain/services/user-admin-activity-log-factory.service';
import { UserAdminAdminProfileMapperService } from './domain/services/user-admin-admin-profile-mapper.service';
import { UserAdminCommandPolicyService } from './domain/services/user-admin-command-policy.service';
import { UserAdminDeletedUserCommandResultMapperService } from './domain/services/user-admin-deleted-user-command-result-mapper.service';
import { UserAdminDeletedUserPageAssemblerService } from './domain/services/user-admin-deleted-user-page-assembler.service';
import { UserAdminDeletedUserStatsResultMapperService } from './domain/services/user-admin-deleted-user-stats-result-mapper.service';
import { UserAdminPaginationAssemblerService } from './domain/services/user-admin-pagination-assembler.service';
import { UserAdminPhoneWhitelistResultMapperService } from './domain/services/user-admin-phone-whitelist-result-mapper.service';
import { UserAdminUserPageAssemblerService } from './domain/services/user-admin-user-page-assembler.service';
import { UserAdminMongooseRepositoryAdapter } from './infrastructure/user-admin-mongoose.repository.adapter';
import { UserAdminRepository } from './repository/user-admin.repository';
import { UserAdminDeletedUserStatsController } from './user-admin-deleted-user-stats.controller';
import { UserAdminDeletedUsersListController } from './user-admin-deleted-users-list.controller';
import { UserAdminHardDeleteUserController } from './user-admin-hard-delete-user.controller';
import { UserAdminPhoneWhitelistCreateController } from './user-admin-phone-whitelist-create.controller';
import { UserAdminPhoneWhitelistDeleteController } from './user-admin-phone-whitelist-delete.controller';
import { UserAdminPhoneWhitelistListController } from './user-admin-phone-whitelist-list.controller';
import { UserAdminPhoneWhitelistUpdateController } from './user-admin-phone-whitelist-update.controller';
import { UserAdminProfileController } from './user-admin-profile.controller';
import { UserAdminRestoreUserController } from './user-admin-restore-user.controller';
import { UserAdminUsersListController } from './user-admin-users-list.controller';
import { UserAdminUserStatusController } from './user-admin-user-status.controller';

const USER_ADMIN_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Admin.name, schema: AdminSchema },
    { name: Breeder.name, schema: BreederSchema },
    { name: Adopter.name, schema: AdopterSchema },
    { name: PhoneWhitelist.name, schema: PhoneWhitelistSchema },
]);

export const USER_ADMIN_MODULE_IMPORTS = [USER_ADMIN_SCHEMA_IMPORTS];

export const USER_ADMIN_MODULE_CONTROLLERS = [
    UserAdminProfileController,
    UserAdminUsersListController,
    UserAdminUserStatusController,
    UserAdminDeletedUsersListController,
    UserAdminDeletedUserStatsController,
    UserAdminRestoreUserController,
    UserAdminHardDeleteUserController,
    UserAdminPhoneWhitelistListController,
    UserAdminPhoneWhitelistCreateController,
    UserAdminPhoneWhitelistUpdateController,
    UserAdminPhoneWhitelistDeleteController,
];

const USER_ADMIN_USE_CASE_PROVIDERS = [
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
];

const USER_ADMIN_DOMAIN_PROVIDERS = [
    UserAdminCommandPolicyService,
    UserAdminDeletedUserPageAssemblerService,
    UserAdminDeletedUserStatsResultMapperService,
    UserAdminDeletedUserCommandResultMapperService,
    UserAdminPaginationAssemblerService,
    UserAdminPhoneWhitelistResultMapperService,
    UserAdminAdminProfileMapperService,
    UserAdminUserPageAssemblerService,
    UserAdminActivityLogFactoryService,
];

const USER_ADMIN_INFRASTRUCTURE_PROVIDERS = [UserAdminRepository, UserAdminMongooseRepositoryAdapter];

const USER_ADMIN_PORT_BINDINGS = [
    {
        provide: USER_ADMIN_READER_PORT,
        useExisting: UserAdminMongooseRepositoryAdapter,
    },
    {
        provide: USER_ADMIN_WRITER_PORT,
        useExisting: UserAdminMongooseRepositoryAdapter,
    },
];

export const USER_ADMIN_MODULE_PROVIDERS = [
    ...USER_ADMIN_USE_CASE_PROVIDERS,
    ...USER_ADMIN_DOMAIN_PROVIDERS,
    ...USER_ADMIN_INFRASTRUCTURE_PROVIDERS,
    ...USER_ADMIN_PORT_BINDINGS,
];
