import { AuthPhoneNumberNormalizerService } from '../../../domain/services/auth-phone-number-normalizer.service';

describe('AuthPhoneNumberNormalizerService', () => {
    const service = new AuthPhoneNumberNormalizerService();

    it('숫자만 남긴다', () => {
        expect(service.normalize('010-1234-5678')).toBe('01012345678');
    });

    it('공백/기호를 제거한다', () => {
        expect(service.normalize('(010) 1234 5678')).toBe('01012345678');
    });

    it('undefined는 undefined', () => {
        expect(service.normalize(undefined)).toBeUndefined();
    });

    it('빈 문자열도 undefined', () => {
        expect(service.normalize('')).toBeUndefined();
    });
});
