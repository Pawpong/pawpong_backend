import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class UploadAdminStoragePolicyService {
    ensureFileName(fileName: string): void {
        if (!fileName) {
            throw new BadRequestException('파일명이 필요합니다.');
        }
    }

    ensureFileNames(fileNames: string[]): void {
        if (!fileNames || fileNames.length === 0) {
            throw new BadRequestException('삭제할 파일이 없습니다.');
        }
    }

    normalizeFolderPrefix(folder: string): string {
        return folder.endsWith('/') ? folder : `${folder}/`;
    }
}
