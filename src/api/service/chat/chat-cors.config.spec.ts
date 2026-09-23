import { buildChatCorsOrigins, isAllowedChatOrigin } from './chat-cors.config';

describe('Android emulator local chat origin', () => {
    it('allows the emulator only in the local app environment', () => {
        const origin = 'http://10.0.2.2:3000';
        expect(isAllowedChatOrigin(origin, buildChatCorsOrigins({ APP_ENV: 'local' }))).toBe(true);
        for (const APP_ENV of ['development', 'production', undefined]) {
            expect(isAllowedChatOrigin(origin, buildChatCorsOrigins({ APP_ENV }))).toBe(false);
        }
    });

    it('does not allow arbitrary hosts or ports with the local exception', () => {
        const allowed = buildChatCorsOrigins({ APP_ENV: 'local' });
        for (const origin of ['http://10.0.2.2:9999', 'http://10.0.2.2.attacker.test:3000']) {
            expect(isAllowedChatOrigin(origin, allowed)).toBe(false);
        }
    });
});
