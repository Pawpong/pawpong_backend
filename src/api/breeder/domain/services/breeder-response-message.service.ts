export const BREEDER_RESPONSE_MESSAGES = {
    searchCompleted: '브리더 검색이 완료되었습니다.',
    popularListRetrieved: '인기 브리더 목록이 조회되었습니다.',
    breederListRetrieved: '브리더 목록이 조회되었습니다.',
    profileRetrieved: '브리더 프로필이 조회되었습니다.',
    applicationFormRetrieved: '입양 신청 폼 구조가 조회되었습니다.',
    reviewsRetrieved: '후기 목록이 조회되었습니다.',
    petsRetrieved: '개체 목록이 조회되었습니다.',
    parentPetsRetrieved: '부모견/부모묘 목록이 조회되었습니다.',
    petDetailRetrieved: '개체 상세 정보가 조회되었습니다.',
    accountSuspended: '브리더 계정이 영구정지 처리되었습니다.',
    accountUnsuspended: '브리더 계정 정지가 해제되었습니다.',
    breederDetailRetrieved: '브리더 상세 정보가 조회되었습니다.',
    breederStatsRetrieved: '브리더 통계가 조회되었습니다.',
    pendingBreederListRetrieved: '승인 대기 브리더 목록이 조회되었습니다.',
    levelChangeRequestListRetrieved: '레벨 변경 신청 목록이 조회되었습니다.',
    verificationUpdated: '브리더 인증 처리가 완료되었습니다.',
    breederLevelChanged: '브리더 레벨이 변경되었습니다.',
    breederReportListRetrieved: '브리더 신고 목록이 조회되었습니다.',
} as const;

export function buildBreederTestAccountMessage(isTestAccount: boolean): string {
    return isTestAccount ? '테스트 계정으로 설정되었습니다.' : '테스트 계정이 해제되었습니다.';
}

export function buildBreederDocumentReminderMessage(sentCount: number): string {
    return `${sentCount}명의 브리더에게 서류 독촉 이메일이 발송되었습니다.`;
}
