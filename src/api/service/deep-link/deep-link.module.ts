import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeepLink, DeepLinkSchema } from '../../../schema/deep-link.schema';
import { DeepLinkRepository } from './repository/deep-link.repository';
import { DeepLinkMongooseReaderAdapter } from './infrastructure/deep-link-mongoose-reader.adapter';
import { DEEP_LINK_READER_PORT } from './application/ports/deep-link-reader.port';
import { ResolveDeepLinkUseCase } from './application/use-cases/resolve-deep-link.use-case';
import { DeepLinkController } from './controller/deep-link.controller';
import { DeepLinkAdminMongooseAdapter } from '../../admin/deep-link/infrastructure/deep-link-admin-mongoose.adapter';
import { DEEP_LINK_ADMIN_STORE_PORT } from '../../admin/deep-link/application/ports/deep-link-admin-store.port';
import { CreateDeepLinkUseCase } from '../../admin/deep-link/application/use-cases/create-deep-link.use-case';
import { UpdateDeepLinkUseCase } from '../../admin/deep-link/application/use-cases/update-deep-link.use-case';
import { DeleteDeepLinkUseCase } from '../../admin/deep-link/application/use-cases/delete-deep-link.use-case';
import { ListDeepLinksUseCase } from '../../admin/deep-link/application/use-cases/list-deep-links.use-case';
import { DeepLinkAdminCommandController } from '../../admin/deep-link/controller/deep-link-admin-command.controller';
import { DeepLinkAdminQueryController } from '../../admin/deep-link/controller/deep-link-admin-query.controller';

/** 동일 도메인의 공개·관리자 포트를 각각 저장소 어댑터에 연결한다. */
@Module({
    imports: [MongooseModule.forFeature([{ name: DeepLink.name, schema: DeepLinkSchema }])],
    controllers: [DeepLinkController, DeepLinkAdminCommandController, DeepLinkAdminQueryController],
    providers: [
        DeepLinkRepository,
        DeepLinkMongooseReaderAdapter,
        DeepLinkAdminMongooseAdapter,
        ResolveDeepLinkUseCase,
        CreateDeepLinkUseCase,
        UpdateDeepLinkUseCase,
        DeleteDeepLinkUseCase,
        ListDeepLinksUseCase,
        { provide: DEEP_LINK_READER_PORT, useExisting: DeepLinkMongooseReaderAdapter },
        { provide: DEEP_LINK_ADMIN_STORE_PORT, useExisting: DeepLinkAdminMongooseAdapter },
    ],
})
export class DeepLinkModule {}
