import { Injectable } from '@nestjs/common';

import { DomainValidationError } from '../../../../../common/error/domain.error';

@Injectable()
export class UploadAdminStoragePolicyService {
    ensureFileName(fileName: string): void {
        if (!fileName) {
            throw new DomainValidationError('파일명이 필요합니다.');
        }
    }

    ensureFileNames(fileNames: string[]): void {
        if (!fileNames || fileNames.length === 0) {
            throw new DomainValidationError('삭제할 파일이 없습니다.');
        }
    }

    normalizeFolderPrefix(folder: string): string {
        return folder.endsWith('/') ? folder : `${folder}/`;
    }
}
