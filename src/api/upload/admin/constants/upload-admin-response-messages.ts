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
