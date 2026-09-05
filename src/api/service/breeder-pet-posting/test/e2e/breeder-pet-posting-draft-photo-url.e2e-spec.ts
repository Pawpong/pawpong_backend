import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestingApp, closeTestingApp, getBreederToken } from '../../../../../common/testing/test-utils';

/**
 * 임시저장 단건 조회의 사진 URL 계약.
 *
 * form 은 파일키만 담고 있어 클라이언트가 미리보기를 그릴 수 없었다.
 * (목록 카드는 primaryPhotoUrl 로 URL 을 받는데 단건만 키였고, 프론트에는 키를 URL 로
 * 바꿀 수단이 없다) 재저장·발행 때는 form 의 키를 그대로 돌려보내야 하므로
 * form 은 그대로 두고 표시용 URL 을 같은 순서로 함께 내려주는지 확인한다.
 */
describe('분양글 임시저장 사진 URL (e2e)', () => {
    let app: INestApplication;
    let breederToken: string;

    beforeAll(async () => {
        app = await createTestingApp();
        const breeder = await getBreederToken(app);
        breederToken = breeder?.token ?? '';
    }, 30000);

    afterAll(async () => {
        await closeTestingApp(app);
    });

    const saveDraft = (body: Record<string, unknown>) =>
        request(app.getHttpServer())
            .post('/api/v2/breeder-pet-posting/drafts')
            .set('Authorization', `Bearer ${breederToken}`)
            .send(body)
            .expect(200);

    const getDraft = (draftId: string) =>
        request(app.getHttpServer())
            .get(`/api/v2/breeder-pet-posting/drafts/${draftId}`)
            .set('Authorization', `Bearer ${breederToken}`)
            .expect(200);

    it('사진 파일키는 form 에 그대로 남고, 표시용 URL 이 같은 순서로 함께 온다', async () => {
        const photos = ['available-pets/draft/1.jpg', 'available-pets/draft/2.jpg'];
        const saved = await saveDraft({
            name: '임시저장 도마뱀',
            photos,
            representativePhotoIndex: 1,
            parentPetSnapshots: [
                { relation: 'mother', name: '엄마', photoFileName: 'available-pets/draft/mom.jpg' },
                { relation: 'father', name: '아빠' },
            ],
            breedingEnvironment: { description: '온도 관리', photoFileName: 'available-pets/draft/env.jpg' },
        });

        const detail = await getDraft(saved.body.data.draftId);
        const data = detail.body.data;

        // 재저장·발행 시 다시 보내야 하므로 키는 그대로 보존된다
        expect(data.form.photos).toEqual(photos);

        // 표시용 URL 은 같은 순서, 같은 개수
        expect(data.photoUrls.pet).toHaveLength(photos.length);
        data.photoUrls.pet.forEach((url: string) => expect(typeof url).toBe('string'));

        // 부모는 사진 없는 행이 null 로 자리를 지켜야 순서가 어긋나지 않는다
        expect(data.photoUrls.parents).toHaveLength(2);
        expect(typeof data.photoUrls.parents[0]).toBe('string');
        expect(data.photoUrls.parents[1]).toBeNull();

        expect(typeof data.photoUrls.breedingEnvironment).toBe('string');
    });

    it('사진이 없는 임시저장도 필드가 항상 존재해 클라이언트가 분기할 수 있다', async () => {
        const saved = await saveDraft({ name: '사진 없는 초안' });

        const detail = await getDraft(saved.body.data.draftId);
        const { photoUrls } = detail.body.data;

        expect(photoUrls.pet).toEqual([]);
        expect(photoUrls.parents).toEqual([]);
        expect(photoUrls.breedingEnvironment).toBeNull();
    });
});
