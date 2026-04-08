import { Injectable } from '@nestjs/common';

export function buildUploadAdminFolderFilesListedMessage(folder: string): string {
    return `${folder} 폴더 파일 목록 조회 완료`;
}

export function buildUploadAdminFolderDeletedMessage(folder: string): string {
    return `${folder} 폴더가 삭제되었습니다.`;
}

export const UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES = {
    filesListed: '파일 목록 조회 완료',
    folderFilesListed: buildUploadAdminFolderFilesListedMessage('profiles'),
    fileDeleted: '파일이 삭제되었습니다.',
    filesDeleted: '파일 삭제가 완료되었습니다.',
    folderDeleted: buildUploadAdminFolderDeletedMessage('profiles'),
    fileReferencesChecked: 'DB 참조 확인 완료',
    referencedFilesListed: 'DB 참조 파일 목록 조회 완료',
} as const;

@Injectable()
export class UploadAdminResponseMessageService {
    filesListed() {
        return UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.filesListed;
    }

    folderFilesListed(folder: string) {
        return buildUploadAdminFolderFilesListedMessage(folder);
    }

    fileDeleted() {
        return UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.fileDeleted;
    }

    filesDeleted() {
        return UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.filesDeleted;
    }

    folderDeleted(folder: string) {
        return buildUploadAdminFolderDeletedMessage(folder);
    }

    fileReferencesChecked() {
        return UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.fileReferencesChecked;
    }

    referencedFilesListed() {
        return UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.referencedFilesListed;
    }
}
