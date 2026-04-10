import {
    buildUploadMultipleFilesUploadedMessage,
    UPLOAD_RESPONSE_MESSAGE_EXAMPLES,
} from '../../constants/upload-response-messages';

describe('파일 업로드 응답 메시지 상수', () => {
    it('파일 업로드 성공 메시지를 일관되게 만든다', () => {
        expect(UPLOAD_RESPONSE_MESSAGE_EXAMPLES.singleFileUploaded).toBe('파일 업로드 성공');
        expect(buildUploadMultipleFilesUploadedMessage(3)).toBe('3개 파일 업로드 성공');
    });
});
