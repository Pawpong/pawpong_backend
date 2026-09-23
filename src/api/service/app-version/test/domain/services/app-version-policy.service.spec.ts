import { DomainValidationError } from '../../../../../../common/error/domain.error';
import { AppVersionPolicyService } from '../../../domain/services/app-version-policy.service';

describe('AppVersionPolicyService', () => {
    const policy = new AppVersionPolicyService();

    describe('ensureCheckRequest', () => {
        it('platform과 currentVersion이 있으면 통과한다', () => {
            expect(() => policy.ensureCheckRequest('ios', '1.0.0')).not.toThrow();
        });

        it('platform이 없으면 DomainValidationError를 던진다', () => {
            expect(() => policy.ensureCheckRequest('' as any, '1.0.0')).toThrow(DomainValidationError);
        });

        it('currentVersion이 없으면 DomainValidationError를 던진다', () => {
            expect(() => policy.ensureCheckRequest('ios', '')).toThrow(DomainValidationError);
        });
    });

    describe('buildCheckResponse', () => {
        const versionInfo = {
            minRequiredVersion: '1.0.0',
            latestVersion: '2.0.0',
            forceUpdateMessage: '강제 업데이트',
            recommendUpdateMessage: '권장 업데이트',
            iosStoreUrl: 'https://apps.apple.com/app/pawpong/id123456789',
            androidStoreUrl: 'https://play.google.com/store/apps/details?id=kr.pawpong.app',
        };

        it('versionInfo가 없으면 업데이트 불필요 응답을 반환한다', () => {
            const result = policy.buildCheckResponse('ios', '1.0.0', null);
            expect(result.needsForceUpdate).toBe(false);
            expect(result.needsRecommendUpdate).toBe(false);
            expect(result.latestVersion).toBe('1.0.0');
        });

        it('현재 버전이 minRequiredVersion보다 낮으면 강제 업데이트', () => {
            const result = policy.buildCheckResponse('ios', '0.9.0', versionInfo as any);
            expect(result.needsForceUpdate).toBe(true);
            expect(result.message).toBe('강제 업데이트');
            expect(result.storeUrl).toBe('https://apps.apple.com/app/pawpong/id123456789');
        });

        it('현재 버전이 latestVersion보다 낮지만 minRequired 이상이면 권장 업데이트', () => {
            const result = policy.buildCheckResponse('android', '1.5.0', versionInfo as any);
            expect(result.needsForceUpdate).toBe(false);
            expect(result.needsRecommendUpdate).toBe(true);
            expect(result.message).toBe('권장 업데이트');
            expect(result.storeUrl).toBe('https://play.google.com/store/apps/details?id=kr.pawpong.app');
        });

        it('현재 버전이 최신이면 업데이트 불필요', () => {
            const result = policy.buildCheckResponse('ios', '2.0.0', versionInfo as any);
            expect(result.needsForceUpdate).toBe(false);
            expect(result.needsRecommendUpdate).toBe(false);
            expect(result.message).toBe('');
        });

        it.each(['', 'javascript:alert(1)', 'https://evil.example'])(
            '기존 설정의 잘못된 스토어 주소 %s는 강제 업데이트하지 않는다',
            (storeUrl) => {
                const result = policy.buildCheckResponse('ios', '0.0.0', {
                    ...versionInfo,
                    iosStoreUrl: storeUrl,
                } as any);
                expect(result).toMatchObject({ needsForceUpdate: false, needsRecommendUpdate: false, storeUrl: '' });
            },
        );

        it('버전 자릿수가 다를 때도 비교 가능하다', () => {
            const result = policy.buildCheckResponse('ios', '1.0', versionInfo as any);
            expect(result.needsForceUpdate).toBe(false);
            expect(result.needsRecommendUpdate).toBe(true);
        });
    });
});
