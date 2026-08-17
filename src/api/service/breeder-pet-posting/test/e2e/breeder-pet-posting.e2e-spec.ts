import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Connection } from 'mongoose';
import request from 'supertest';

import {
    createTestingApp,
    closeTestingApp,
    getAdopterToken,
    getBreederToken,
} from '../../../../../common/testing/test-utils';

/**
 * v2 분양글 e2e — 임시저장(draft) 흐름 + 사육환경 사진 배열 저장 검증.
 */
describe('분양글 (브리더) E2E 테스트', () => {
    let app: INestApplication;
    let breederToken: string;
    let adopterToken: string;

    /** 등록 API 가 요구하는 최소 완성 폼 */
    const validPostingBody = () => ({
        name: '레오파드게코 도마뱀(만다린)',
        breed: '레오파드게코',
        gender: 'female',
        birthDate: '2024-11-05',
        price: 200000,
        description: '귀여운 파이리',
        photos: ['available-pets/e2e/1.jpg', 'available-pets/e2e/2.jpg'],
        representativePhotoIndex: 0,
        petType: 'reptile',
        vaccinationStatus: 'completed',
        vaccinationRecords: [{ name: '종합백신', date: '2024-12-01', round: 1 }],
        geneticTestStatus: 'incomplete',
        geneticTestIncompleteReason: '태어난지 한달도 안됨',
    });

    beforeAll(async () => {
        app = await createTestingApp();

        const breeder = await getBreederToken(app);
        expect(breeder).not.toBeNull();
        breederToken = breeder!.token;

        const adopter = await getAdopterToken(app);
        expect(adopter).not.toBeNull();
        adopterToken = adopter!.token;
    });

    afterAll(async () => {
        await closeTestingApp(app);
    });

    // ─── 임시저장 (draft) ────────────────────────────────────────────────

    describe('임시저장 흐름', () => {
        let draftId: string;

        it('POST /drafts 미완성 폼(이름만) 저장 → 200 + draftId', async () => {
            const res = await request(app.getHttpServer())
                .post('/api/v2/breeder-pet-posting/drafts')
                .set('Authorization', `Bearer ${breederToken}`)
                .send({ name: '작성 중인 게코' })
                .expect(200);

            expect(res.body.data.draftId).toBeDefined();
            draftId = res.body.data.draftId;
        });

        it('POST /drafts 인증 없음 → 401', async () => {
            await request(app.getHttpServer())
                .post('/api/v2/breeder-pet-posting/drafts')
                .send({ name: 'x' })
                .expect(401);
        });

        it('POST /drafts 입양자 토큰 → 403 (브리더 전용)', async () => {
            await request(app.getHttpServer())
                .post('/api/v2/breeder-pet-posting/drafts')
                .set('Authorization', `Bearer ${adopterToken}`)
                .send({ name: 'x' })
                .expect(403);
        });

        it('GET /drafts → 저장한 draft 카드 반환, 미입력 필드는 null', async () => {
            const res = await request(app.getHttpServer())
                .get('/api/v2/breeder-pet-posting/drafts')
                .set('Authorization', `Bearer ${breederToken}`)
                .expect(200);

            const card = res.body.data.find((item: any) => item.draftId === draftId);
            expect(card).toBeDefined();
            expect(card.name).toBe('작성 중인 게코');
            expect(card.breed).toBeNull();
            expect(card.primaryPhotoUrl).toBeNull();
            expect(card.updatedAt).toBeDefined();
        });

        it('PUT /drafts/:draftId 덮어쓰기 → GET 상세에서 최신 폼 복원', async () => {
            await request(app.getHttpServer())
                .put(`/api/v2/breeder-pet-posting/drafts/${draftId}`)
                .set('Authorization', `Bearer ${breederToken}`)
                .send({ name: '수정된 게코', photos: ['available-pets/e2e/draft.jpg'], price: 150000 })
                .expect(200);

            const res = await request(app.getHttpServer())
                .get(`/api/v2/breeder-pet-posting/drafts/${draftId}`)
                .set('Authorization', `Bearer ${breederToken}`)
                .expect(200);

            expect(res.body.data.draftId).toBe(draftId);
            expect(res.body.data.form.name).toBe('수정된 게코');
            expect(res.body.data.form.photos).toEqual(['available-pets/e2e/draft.jpg']);
            expect(res.body.data.form.price).toBe(150000);
        });

        it('GET /drafts/:draftId 존재하지 않는 ID → 400', async () => {
            const res = await request(app.getHttpServer())
                .get(`/api/v2/breeder-pet-posting/drafts/${new ObjectId().toString()}`)
                .set('Authorization', `Bearer ${breederToken}`)
                .expect(400);

            expect(res.body.error).toContain('해당 임시저장 글을 찾을 수 없습니다');
        });

        it('분양글 등록에 draftId 전달 → 등록 성공 + 해당 draft 자동 삭제', async () => {
            const res = await request(app.getHttpServer())
                .post('/api/v2/breeder-pet-posting')
                .set('Authorization', `Bearer ${breederToken}`)
                .send({ ...validPostingBody(), draftId })
                .expect(200);

            expect(res.body.data.petId).toBeDefined();

            // draft 가 정리됐는지 확인
            await request(app.getHttpServer())
                .get(`/api/v2/breeder-pet-posting/drafts/${draftId}`)
                .set('Authorization', `Bearer ${breederToken}`)
                .expect(400);
        });

        it('DELETE /drafts/:draftId → 200, 같은 ID 재삭제 → 400', async () => {
            const saved = await request(app.getHttpServer())
                .post('/api/v2/breeder-pet-posting/drafts')
                .set('Authorization', `Bearer ${breederToken}`)
                .send({ description: '지울 draft' })
                .expect(200);
            const deletableId = saved.body.data.draftId;

            const res = await request(app.getHttpServer())
                .delete(`/api/v2/breeder-pet-posting/drafts/${deletableId}`)
                .set('Authorization', `Bearer ${breederToken}`)
                .expect(200);
            expect(res.body.data).toEqual({ draftId: deletableId, deleted: true });

            await request(app.getHttpServer())
                .delete(`/api/v2/breeder-pet-posting/drafts/${deletableId}`)
                .set('Authorization', `Bearer ${breederToken}`)
                .expect(400);
        });

        it('임시저장 10개 상한 초과 → 400', async () => {
            const conn = app.get<Connection>(getConnectionToken());
            const countNow = await conn.collection('breeder_pet_posting_drafts').countDocuments();

            // 상한까지 채운다 (이미 있는 draft 수만큼 빼고)
            for (let i = countNow; i < 10; i += 1) {
                await request(app.getHttpServer())
                    .post('/api/v2/breeder-pet-posting/drafts')
                    .set('Authorization', `Bearer ${breederToken}`)
                    .send({ name: `채우기 ${i}` })
                    .expect(200);
            }

            const res = await request(app.getHttpServer())
                .post('/api/v2/breeder-pet-posting/drafts')
                .set('Authorization', `Bearer ${breederToken}`)
                .send({ name: '11번째' })
                .expect(400);

            expect(res.body.error).toContain('최대 10개');
        });
    });

    // ─── 사육환경 사진 배열 ──────────────────────────────────────────────

    describe('사육환경 사진 배열 (최대 5장)', () => {
        it('photoFileNames 배열로 등록 → DB 에 배열 + 첫 장 단일 필드 저장', async () => {
            const res = await request(app.getHttpServer())
                .post('/api/v2/breeder-pet-posting')
                .set('Authorization', `Bearer ${breederToken}`)
                .send({
                    ...validPostingBody(),
                    breedingEnvironment: {
                        description: '온습도 일정한 전용 사육장',
                        photoFileNames: ['available-pets/e2e/env-1.jpg', 'available-pets/e2e/env-2.jpg'],
                    },
                })
                .expect(200);

            const conn = app.get<Connection>(getConnectionToken());
            const doc = await conn
                .collection('available_pets')
                .findOne({ _id: new ObjectId(res.body.data.petId as string) });

            expect(doc?.breedingEnvironment?.photoFileNames).toEqual([
                'available-pets/e2e/env-1.jpg',
                'available-pets/e2e/env-2.jpg',
            ]);
            // 배열 도입 전 소비자를 위한 하위 호환 — 첫 장이 단일 필드로도 저장된다
            expect(doc?.breedingEnvironment?.photoFileName).toBe('available-pets/e2e/env-1.jpg');
        });

        it('레거시 단일 photoFileName 만 보내도 배열로 승격 저장', async () => {
            const res = await request(app.getHttpServer())
                .post('/api/v2/breeder-pet-posting')
                .set('Authorization', `Bearer ${breederToken}`)
                .send({
                    ...validPostingBody(),
                    breedingEnvironment: { photoFileName: 'available-pets/e2e/legacy.jpg' },
                })
                .expect(200);

            const conn = app.get<Connection>(getConnectionToken());
            const doc = await conn
                .collection('available_pets')
                .findOne({ _id: new ObjectId(res.body.data.petId as string) });

            expect(doc?.breedingEnvironment?.photoFileNames).toEqual(['available-pets/e2e/legacy.jpg']);
            expect(doc?.breedingEnvironment?.photoFileName).toBe('available-pets/e2e/legacy.jpg');
        });

        it('photoFileNames 6장 → 400 (DTO 검증)', async () => {
            await request(app.getHttpServer())
                .post('/api/v2/breeder-pet-posting')
                .set('Authorization', `Bearer ${breederToken}`)
                .send({
                    ...validPostingBody(),
                    breedingEnvironment: {
                        photoFileNames: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'],
                    },
                })
                .expect(400);
        });
    });
});
