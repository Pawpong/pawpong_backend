import express from 'express';
import request from 'supertest';
import { swaggerAccess } from './swagger-access';

describe('Swagger authentication boundary', () => {
    const create = (options = {}) => {
        const app = express();
        app.use(swaggerAccess({ production: true, username: 'docs', password: 'test-only-secret', ...options }));
        app.use((_req, res) => res.send('protected content'));
        return app;
    };
    it.each(['/docs', '/docs/', '/docs-json', '/docs-yaml', '/docs/swagger-ui-init.js', '/DOCS', '/%64ocs-json'])(
        'protects %s',
        async (url) => {
            const response = await request(create()).get(url).expect(401);
            expect(response.headers['cache-control']).toBe('no-store');
            expect(response.headers['www-authenticate']).toContain('Basic');
            expect(response.text).not.toContain('protected content');
        },
    );
    it('accepts valid credentials and rejects invalid credentials', async () => {
        await request(create()).get('/docs-json').auth('docs', 'test-only-secret').expect(200);
        await request(create()).get('/docs-json').auth('docs', 'wrong').expect(401);
    });
    it('fails closed without configuration without breaking API health', async () => {
        await request(create({ password: undefined }))
            .get('/docs')
            .expect(503);
        await request(create({ password: undefined }))
            .get('/api/health')
            .expect(200);
    });
    it('never permits development bypass in production', async () => {
        await request(create({ developmentPublic: true }))
            .get('/docs')
            .expect(401);
        await request(create({ production: false, developmentPublic: true }))
            .get('/docs')
            .expect(200);
    });
});
