import type { Connection } from 'mongoose';
import { Types } from 'mongoose';
import { CONTENT_RIGHTS_VERSION, eligibleAppAuthorIds, isIosAppRequest, runWithAppRequest } from './app-request-context';

describe('iOS 앱 게시물 이용 동의 조회', () => {
    const adopterId = new Types.ObjectId();
    const breederId = new Types.ObjectId();
    const distinct = jest.fn((name: string, _filter: unknown) => name === 'adopters' ? Promise.resolve([adopterId]) : Promise.resolve([breederId]));
    const connection = {
        db: { collection: (name: string) => ({ distinct: (_field: string, filter: unknown) => distinct(name, filter) }) },
    } as unknown as Connection;

    beforeEach(() => distinct.mockClear());

    it('일반 웹과 Android 요청에는 iOS 콘텐츠 필터를 적용하지 않는다', async () => {
        await runWithAppRequest('Mozilla/5.0', async () => {
            expect(isIosAppRequest()).toBe(false);
            expect(await eligibleAppAuthorIds(connection)).toEqual([]);
        });
        await runWithAppRequest('Mozilla/5.0 PawpongApp/Android', async () => {
            expect(isIosAppRequest()).toBe(false);
        });
        expect(distinct).not.toHaveBeenCalled();
    });

    it('iOS 요청은 현재 동의 버전이 있는 작성자만 조회하고 요청 안에서 결과를 재사용한다', async () => {
        await runWithAppRequest('Mozilla/5.0 PawpongApp/iOS', async () => {
            expect(isIosAppRequest()).toBe(true);
            expect(await eligibleAppAuthorIds(connection)).toEqual([adopterId, breederId]);
            expect(await eligibleAppAuthorIds(connection)).toEqual([adopterId, breederId]);
        });
        expect(distinct).toHaveBeenCalledTimes(2);
        expect(distinct).toHaveBeenCalledWith('adopters', { accountStatus: 'active', contentRightsConsentVersion: CONTENT_RIGHTS_VERSION });
        expect(distinct).toHaveBeenCalledWith('breeders', { accountStatus: 'active', contentRightsConsentVersion: CONTENT_RIGHTS_VERSION });
    });
});
