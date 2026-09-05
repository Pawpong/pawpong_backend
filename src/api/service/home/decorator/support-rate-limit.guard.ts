import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import type { Request } from 'express';

/** 공개 AI 문의의 인스턴스별 요청량을 제한한다. 원문·IP는 영구 저장하지 않는다. */
@Injectable()
export class SupportRateLimitGuard implements CanActivate {
    private readonly windows = new Map<string, { count: number; until: number }>();
    private total = { count: 0, until: 0 };

    canActivate(context: ExecutionContext): boolean {
        const now = Date.now();
        for (const [key, value] of this.windows) if (value.until <= now) this.windows.delete(key);
        if (this.total.until <= now) this.total = { count: 0, until: now + 60_000 };
        const request = context.switchToHttp().getRequest<Request>();
        const key = request.ip || request.socket.remoteAddress || 'unknown';
        const window = this.windows.get(key) ?? { count: 0, until: now + 60_000 };
        if (window.count >= 5 || this.total.count >= 60) {
            throw new HttpException('문의가 많습니다. 잠시 후 다시 시도해 주세요.', 429);
        }
        window.count++;
        this.total.count++;
        this.windows.set(key, window);
        return true;
    }
}
