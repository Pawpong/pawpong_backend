import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadResponseMessageService {
    singleFileUploaded() {
        return '파일 업로드 성공';
    }

    multipleFilesUploaded(fileCount: number) {
        return `${fileCount}개 파일 업로드 성공`;
    }

    fileDeleted() {
        return '파일 삭제 성공';
    }

    representativePhotosUploaded() {
        return '대표 사진이 업로드되고 저장되었습니다.';
    }

    availablePetPhotosUploaded() {
        return '분양 개체 사진이 업로드되고 저장되었습니다.';
    }

    parentPetPhotosUploaded() {
        return '부모견/묘 사진이 업로드되고 저장되었습니다.';
    }
}
