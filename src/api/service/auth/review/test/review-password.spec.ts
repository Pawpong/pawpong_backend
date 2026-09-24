import bcrypt from 'bcryptjs';
import { ReviewPasswordAdapter } from '../infrastructure/review-password.adapter';

describe('review password comparison', () => {
    const adapter = new ReviewPasswordAdapter();
    let hash: string;
    beforeAll(async () => {
        hash = await bcrypt.hash('a'.repeat(72), 12);
    });
    it('compares a valid 72-byte password and rejects wrong passwords', async () => {
        expect(await adapter.verify('a'.repeat(72), hash)).toBe(true);
        expect(await adapter.verify('b'.repeat(72), hash)).toBe(false);
    });
    it('rejects bcrypt truncation collisions including multibyte input', async () => {
        expect(await adapter.verify('a'.repeat(72) + 'extra', hash)).toBe(false);
        expect(await adapter.verify('가'.repeat(25), hash)).toBe(false);
    });
    it('uses a dummy comparison for missing and malformed hashes without throwing', async () => {
        expect(await adapter.verify('synthetic-password', null)).toBe(false);
        expect(await adapter.verify('synthetic-password', 'bad-hash')).toBe(false);
    });
});
