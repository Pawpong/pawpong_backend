import type { Request } from 'express';
import proxyaddr from 'proxy-addr';

// API 앞의 로컬/nginx 컨테이너만 신뢰한다. 공개 IP 홉에서 탐색을 멈추므로 공격자가
// X-Forwarded-For 앞에 붙인 임의 IP는 rate-limit 키가 되지 않는다.
const trustedNativeProxy = proxyaddr.compile(['loopback', 'linklocal', 'uniquelocal']);

/** 앱 전역 trust proxy=true와 독립된 보수적 경계를 적용한다. 알 수 없는 공개 프록시는 한 IP로 묶는다. */
export function nativeAuthClientAddress(request: Request): string {
    try {
        return proxyaddr(request, trustedNativeProxy);
    } catch {
        return request.socket.remoteAddress || 'unknown';
    }
}
