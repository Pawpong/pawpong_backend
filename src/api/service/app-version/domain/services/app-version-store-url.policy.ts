/** 관리자 설정과 공개 정책 모두 신뢰할 수 있는 앱 스토어 주소만 사용한다. */
export function isAppStoreUrl(value: string, platform: 'ios' | 'android'): boolean {
    if (typeof value !== 'string' || !value || /[\s<>"'`\\]/.test(value)) return false;
    try {
        const url = new URL(value);
        const host = platform === 'ios' ? 'apps.apple.com' : 'play.google.com';
        if (url.protocol !== 'https:' || url.hostname !== host || url.username || url.password || url.port)
            return false;
        // 허용 도메인의 다른 앱·검색 화면도 업데이트를 끝낼 수 없는 주소다.
        if (platform === 'ios') return /^\/(?:[a-z]{2}\/)?app\/(?:[^/]+\/)?id6814126823\/?$/.test(url.pathname);
        return (
            url.pathname === '/store/apps/details' &&
            url.searchParams.getAll('id').length === 1 &&
            url.searchParams.get('id') === 'kr.pawpong.app'
        );
    } catch {
        return false;
    }
}
