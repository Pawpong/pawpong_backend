export const ADOPTER_RESPONSE_MESSAGES = {
    profileRetrieved: '입양자 프로필이 조회되었습니다.',
    profileUpdated: '프로필이 성공적으로 수정되었습니다.',
    applicationCreated: '입양 신청이 성공적으로 제출되었습니다.',
    applicationListRetrieved: '입양 신청 목록이 조회되었습니다.',
    applicationDetailRetrieved: '입양 신청 상세 정보가 조회되었습니다.',
    reviewCreated: '후기가 성공적으로 작성되었습니다.',
    reviewReported: '후기가 신고되었습니다.',
    reviewListRetrieved: '내가 작성한 후기 목록이 조회되었습니다.',
    reviewDetailRetrieved: '후기 세부 정보가 조회되었습니다.',
    favoriteAdded: '즐겨찾기에 성공적으로 추가되었습니다.',
    favoriteRemoved: '즐겨찾기에서 성공적으로 삭제되었습니다.',
    favoriteListRetrieved: '즐겨찾기 목록이 조회되었습니다.',
    reportSubmitted: '신고가 성공적으로 제출되었습니다.',
    accountDeleted: '회원 탈퇴가 완료되었습니다.',
    adminReviewReportListRetrieved: '후기 신고 목록이 조회되었습니다.',
    adminReviewDeleted: '부적절한 후기가 삭제되었습니다.',
    adminApplicationListRetrieved: '입양 신청 리스트가 조회되었습니다.',
    adminApplicationDetailRetrieved: '입양 신청 상세 정보가 조회되었습니다.',
} as const;

export const ADOPTER_RESPONSE_PAYLOAD_MESSAGES = {
    reportAccepted: '신고가 성공적으로 접수되었습니다. 관리자 검토 후 처리됩니다.',
    reviewReported: '후기가 신고되었습니다. 관리자가 검토 후 처리합니다.',
    accountDeleted: '회원 탈퇴가 성공적으로 처리되었습니다.',
} as const;
