export function buildUploadMultipleFilesUploadedMessage(fileCount: number): string {
    return `${fileCount}개 파일 업로드 성공`;
}

export const UPLOAD_RESPONSE_MESSAGE_EXAMPLES = {
    singleFileUploaded: '파일 업로드 성공',
    multipleFilesUploaded: buildUploadMultipleFilesUploadedMessage(2),
    fileDeleted: '파일 삭제 성공',
    representativePhotosUploaded: '대표 사진이 업로드되고 저장되었습니다.',
    availablePetPhotosUploaded: '분양 개체 사진이 업로드되고 저장되었습니다.',
    parentPetPhotosUploaded: '부모견/묘 사진이 업로드되고 저장되었습니다.',
} as const;
