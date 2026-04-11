import { AppVersionAdminSnapshot } from './app-version-admin-reader.port';
import { type AppVersionCreateCommand, type AppVersionUpdateCommand } from '../types/app-version-command.type';

export const APP_VERSION_WRITER_PORT = Symbol('APP_VERSION_WRITER_PORT');

export interface AppVersionWriterPort {
    create(createData: AppVersionCreateCommand): Promise<AppVersionAdminSnapshot>;
    update(appVersionId: string, updateData: AppVersionUpdateCommand): Promise<AppVersionAdminSnapshot | null>;
    delete(appVersionId: string): Promise<boolean>;
}
