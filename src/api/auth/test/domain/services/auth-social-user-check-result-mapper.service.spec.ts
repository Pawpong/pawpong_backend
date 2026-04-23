import { AuthSocialUserCheckResultMapperService } from '../../../domain/services/auth-social-user-check-result-mapper.service';

describe('AuthSocialUserCheckResultMapperService', () => {
    const service = new AuthSocialUserCheckResultMapperService();

    it('adopter: exists=true, userRole=adopter, nickname 기본값', () => {
        const result = service.toAdopterResult({
            _id: { toString: () => 'u-1' },
            emailAddress: 'a@b.com',
            nickname: '닉',
            profileImageFileName: 'p.png',
        } as any);
        expect(result.exists).toBe(true);
        if (result.exists) {
            expect(result.userRole).toBe('adopter');
            expect(result.nickname).toBe('닉');
            expect(result.profileImageFileName).toBe('p.png');
        }
    });

    it('adopter: nickname 없으면 빈 문자열', () => {
        const result = service.toAdopterResult({
            _id: { toString: () => 'u-1' },
            emailAddress: 'a',
        } as any);
        if (result.exists) {
            expect(result.nickname).toBe('');
        }
    });

    it('breeder: name > nickname 순서', () => {
        const result = service.toBreederResult({
            _id: { toString: () => 'b-1' },
            emailAddress: 'b',
            name: '브리더',
        } as any);
        if (result.exists) {
            expect(result.userRole).toBe('breeder');
            expect(result.nickname).toBe('브리더');
        }

        const result2 = service.toBreederResult({
            _id: { toString: () => 'b-2' },
            emailAddress: 'b',
            nickname: '닉',
        } as any);
        if (result2.exists) {
            expect(result2.nickname).toBe('닉');
        }
    });

    it('toNotFoundResult: exists=false만', () => {
        expect(service.toNotFoundResult()).toEqual({ exists: false });
    });
});
