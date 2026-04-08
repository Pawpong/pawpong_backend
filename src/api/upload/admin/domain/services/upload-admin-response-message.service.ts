import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadAdminResponseMessageService {
    filesListed() {
        return '파일 목록 조회 완료';
    }

    folderFilesListed(folder: string) {
        return `${folder} 폴더 파일 목록 조회 완료`;
    }

    fileDeleted() {
        return '파일이 삭제되었습니다.';
    }

    filesDeleted() {
        return '파일 삭제가 완료되었습니다.';
    }

    folderDeleted(folder: string) {
        return `${folder} 폴더가 삭제되었습니다.`;
    }

    fileReferencesChecked() {
        return 'DB 참조 확인 완료';
    }

    referencedFilesListed() {
        return 'DB 참조 파일 목록 조회 완료';
    }
}
