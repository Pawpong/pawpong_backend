import { createHash, timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';

/** 문서 UI/에셋/JSON/YAML을 동일 경계에서 보호하며 운영에서 공개 우회를 허용하지 않는다. */
export function swaggerAccess(options: {
    username?: string;
    password?: string;
    developmentPublic?: boolean;
    production: boolean;
}): RequestHandler {
    const digest = (value: string) => createHash('sha256').update(value).digest();
    return (req, res, next) => {
        let pathname: string;
        try {
            pathname = decodeURIComponent(req.path)
                .replace(/\/{2,}/g, '/')
                .toLowerCase();
        } catch {
            res.status(400).end();
            return;
        }
        if (!/^\/docs(?:\/|$|[-.])/.test(pathname)) return next();
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('X-Robots-Tag', 'noindex, nofollow');
        if (!options.production && options.developmentPublic) return next();
        if (!options.username || !options.password) {
            res.status(503).send('API documentation is not configured.');
            return;
        }
        const header = req.headers.authorization ?? '';
        const encoded = /^Basic ([A-Za-z0-9+/]+=*)$/i.exec(header)?.[1];
        const credentials = encoded && encoded.length <= 4096 ? Buffer.from(encoded, 'base64').toString('utf8') : '';
        const expected = `${options.username}:${options.password}`;
        if (!timingSafeEqual(digest(credentials), digest(expected))) {
            res.setHeader('WWW-Authenticate', 'Basic realm="Pawpong API Docs", charset="UTF-8"');
            res.status(401).send('Authentication required.');
            return;
        }
        next();
    };
}
