import { Injectable } from '@nestjs/common';

import { StorageFileResponseDto } from './dto/response/storage-file-response.dto';
import { StorageListResponseDto } from './dto/response/storage-list-response.dto';
import { FileReferenceDto, FileReferenceResponseDto } from './dto/response/file-reference-response.dto';
import { ListAllFilesUseCase } from './application/use-cases/list-all-files.use-case';
import { ListFilesByFolderUseCase } from './application/use-cases/list-files-by-folder.use-case';
import { DeleteFileUseCase } from './application/use-cases/delete-file.use-case';
import { DeleteMultipleFilesUseCase } from './application/use-cases/delete-multiple-files.use-case';
import { DeleteFolderUseCase } from './application/use-cases/delete-folder.use-case';
import { CheckFileReferencesUseCase } from './application/use-cases/check-file-references.use-case';
import { GetAllReferencedFilesUseCase } from './application/use-cases/get-all-referenced-files.use-case';

/**
 * Admin용 스토리지 관리 서비스
 * StorageService를 활용하여 AWS S3 중복 초기화 방지
 */
@Injectable()
export class UploadAdminService {
    constructor(
        private readonly listAllFilesUseCase: ListAllFilesUseCase,
        private readonly listFilesByFolderUseCase: ListFilesByFolderUseCase,
        private readonly deleteFileUseCase: DeleteFileUseCase,
        private readonly deleteMultipleFilesUseCase: DeleteMultipleFilesUseCase,
        private readonly deleteFolderUseCase: DeleteFolderUseCase,
        private readonly checkFileReferencesUseCase: CheckFileReferencesUseCase,
        private readonly getAllReferencedFilesUseCase: GetAllReferencedFilesUseCase,
    ) {}

    /**
     * 버킷 내 전체 파일 목록 조회
     */
    async listAllFiles(prefix?: string): Promise<StorageListResponseDto> {
        return this.listAllFilesUseCase.execute(prefix);
    }

    /**
     * 특정 폴더의 파일 목록 조회
     */
    async listFilesByFolder(folder: string): Promise<StorageListResponseDto> {
        return this.listFilesByFolderUseCase.execute(folder);
    }

    /**
     * 파일 삭제
     */
    async deleteFile(fileName: string): Promise<void> {
        return this.deleteFileUseCase.execute(fileName);
    }

    /**
     * 다중 파일 삭제
     */
    async deleteMultipleFiles(fileNames: string[]): Promise<{ deletedCount: number; failedFiles: string[] }> {
        return this.deleteMultipleFilesUseCase.execute(fileNames);
    }

    /**
     * 폴더 전체 삭제
     */
    async deleteFolder(folder: string): Promise<{ deletedCount: number; failedFiles: string[] }> {
        return this.deleteFolderUseCase.execute(folder);
    }

    /**
     * 파일들의 DB 참조 여부 확인
     * 스토리지 파일이 실제 DB에서 사용 중인지 확인합니다
     */
    async checkFileReferences(fileKeys: string[]): Promise<FileReferenceResponseDto> {
        return this.checkFileReferencesUseCase.execute(fileKeys);
    }

    /**
     * 모든 DB에서 사용 중인 파일 목록 조회
     */
    async getAllReferencedFiles(): Promise<string[]> {
        return this.getAllReferencedFilesUseCase.execute();
    }
}
