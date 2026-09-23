/** 관리자 설정과 공개 정책 모두 신뢰할 수 있는 앱 스토어 주소만 사용한다. */
export function isAppStoreUrl(value: string, platform: 'ios' | 'android'): boolean {
    if (typeof value !== 'string' || !value || /[\s<>"'`\\]/.test(value)) return false;
    try {
        const url = new URL(value);
        const host = platform === 'ios' ? 'apps.apple.com' : 'play.google.com';
        return url.protocol === 'https:' && url.hostname === host && !url.username && !url.password && !url.port;
    } catch {
        return false;
    }
}
