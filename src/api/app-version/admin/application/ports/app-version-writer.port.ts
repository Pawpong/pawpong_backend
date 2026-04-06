import { AppVersionCreateRequestDto } from '../../../dto/request/app-version-create-request.dto';
import { AppVersionUpdateRequestDto } from '../../../dto/request/app-version-update-request.dto';
import { AppVersionAdminSnapshot } from './app-version-admin-reader.port';

export const APP_VERSION_WRITER = Symbol('APP_VERSION_WRITER');

export interface AppVersionWriterPort {
    create(createData: AppVersionCreateRequestDto): Promise<AppVersionAdminSnapshot>;
    update(appVersionId: string, updateData: AppVersionUpdateRequestDto): Promise<AppVersionAdminSnapshot | null>;
    delete(appVersionId: string): Promise<boolean>;
}
