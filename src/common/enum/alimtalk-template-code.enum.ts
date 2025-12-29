/**
 * 카카오 알림톡 템플릿 코드
 *
 * @description
 * MongoDB alimtalk_templates 컬렉션의 templateCode와 매핑됩니다.

 *
 */
export enum AlimtalkTemplateCodeEnum {
    /** 회원가입 인증번호 */
    VERIFICATION_CODE = 'VERIFICATION_CODE',
    /** 브리더 입점 승인 */
    BREEDER_APPROVED = 'BREEDER_APPROVED',
    /** 브리더 입점 반려 */
    BREEDER_REJECTED = 'BREEDER_REJECTED',
    /** 상담 신청 알림 (브리더에게) */
    CONSULTATION_REQUEST = 'CONSULTATION_REQUEST',
    /** 상담 완료 알림 (입양자에게) */
    CONSULTATION_COMPLETE = 'CONSULTATION_COMPLETE',
    /** 새 후기 등록 알림 */
    NEW_REVIEW = 'NEW_REVIEW',
    /** 서류 미제출 브리더 계정 활성화 알림 */
    DOCUMENT_REMINDER = 'DOCUMENT_REMINDER',
}
