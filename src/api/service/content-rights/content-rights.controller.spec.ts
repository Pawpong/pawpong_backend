import type { Connection } from 'mongoose';
import { Types } from 'mongoose';
import { CONTENT_RIGHTS_VERSION } from '../../../common/content-rights/app-request-context';
import { ContentRightsController } from './content-rights.controller';

describe('작성자 게시물 표시 재동의', () => {
    const userId = String(new Types.ObjectId());
    const saved = { contentRightsConsentVersion: CONTENT_RIGHTS_VERSION, contentRightsConsentedAt: new Date() };
    const findOneAndUpdate = jest.fn().mockResolvedValue(saved);
    const findOne = jest.fn().mockResolvedValue(saved);
    const collection = jest.fn().mockReturnValue({ findOneAndUpdate, findOne });
    const controller = new ContentRightsController({ db: { collection } } as unknown as Connection);

    beforeEach(() => { findOneAndUpdate.mockClear(); findOne.mockClear(); collection.mockClear(); });

    it('입양자 동의는 현재 버전과 시각을 계정에 기록하고 이력에 추가한다', async () => {
        const response = await controller.consent(userId, 'adopter', { version: CONTENT_RIGHTS_VERSION, accepted: true });
        expect(collection).toHaveBeenCalledWith('adopters');
        expect(findOneAndUpdate.mock.calls[0][0]).toMatchObject({
            _id: new Types.ObjectId(userId), accountStatus: 'active',
            contentRightsConsentVersion: { $ne: CONTENT_RIGHTS_VERSION },
        });
        expect(findOneAndUpdate.mock.calls[0][1].$push.contentRightsConsentHistory.version).toBe(CONTENT_RIGHTS_VERSION);
        expect(response.data?.accepted).toBe(true);
    });

    it('이미 동의한 브리더가 다시 요청해도 이력을 중복 추가하지 않는다', async () => {
        findOneAndUpdate.mockResolvedValueOnce(null);
        const response = await controller.consent(userId, 'breeder', { version: CONTENT_RIGHTS_VERSION, accepted: true });
        expect(collection).toHaveBeenCalledWith('breeders');
        expect(findOne).toHaveBeenCalledTimes(1);
        expect(response.data?.consentedAt).toEqual(saved.contentRightsConsentedAt);
    });
});
