import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Connection } from 'mongoose';
import request from 'supertest';

import { StorageService } from '../../../../../common/storage/storage.service';
import { closeTestingApp, createTestingApp, getAdminToken } from '../../../../../common/testing/test-utils';

// ─── 약관 시드 (v2 회원가입 필수 전제) ──────────────────────────────────────

async function seedRequiredTerms(app: INestApplication): Promise<void> {
    const conn = app.get<Connection>(getConnectionToken());
    await conn.collection('terms').insertMany([
        {
            code: 'service',
            version: 'v1.0',
            title: '서비스 이용약관',
            body: '테스트 약관 본문',
            isRequired: true,
            isActive: true,
            activatedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            code: 'privacy',
            version: 'v1.0',
            title: '개인정보 수집 및 이용 동의',
            body: '테스트 약관 본문',
            isRequired: true,
            isActive: true,
            activatedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            code: 'age_14plus',
            version: 'v1.0',
            title: '만 14세 이상 확인',
            body: '테스트 약관 본문',
            isRequired: true,
            isActive: true,
            activatedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);
}

// ─── v2 입양자 등록 헬퍼 ────────────────────────────────────────────────────

async function registerAdopterV2(app: INestApplication): Promise<{ token: string; adopterId: string } | null> {
    const timestamp = Date.now();
    const providerId = Math.random().toString().slice(2, 12);

    const res = await request(app.getHttpServer())
        .post('/api/v2/auth/register/adopter')
        .send({
            tempId: `temp_kakao_${providerId}_${timestamp}`,
            email: `adopter_${timestamp}_${providerId}@test.com`,
            nickname: `테스트입양자${timestamp}`.slice(0, 20),
            realName: '테스트유저',
            termsAgreements: [
                { code: 'service', version: 'v1.0' },
                { code: 'privacy', version: 'v1.0' },
                { code: 'age_14plus', version: 'v1.0' },
            ],
        });

    if (res.status === 200 && res.body.data?.accessToken) {
        return { token: res.body.data.accessToken, adopterId: res.body.data.adopterId };
    }
    return null;
}

// ─── 콘테스트 시드 헬퍼 ─────────────────────────────────────────────────────

async function seedContest(
    app: INestApplication,
    overrides: Record<string, unknown> = {},
): Promise<{ contestId: string }> {
    const conn = app.get<Connection>(getConnectionToken());
    const result = await conn.collection('contests').insertOne({
        title: '이번주 명예의 전당',
        description: '가장 귀여운 반려동물을 뽑아요',
        benefitText: '1등 상품: 포상',
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'active',
        participantCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    });
    return { contestId: result.insertedId.toString() };
}

async function seedEndedContest(app: INestApplication): Promise<{ contestId: string }> {
    return seedContest(app, {
        title: '저번주 명예의 전당',
        status: 'ended',
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    });
}

async function seedContestEntry(
    app: INestApplication,
    contestId: string,
    userId: string,
    overrides: Record<string, unknown> = {},
): Promise<{ entryId: string }> {
    const conn = app.get<Connection>(getConnectionToken());
    const result = await conn.collection('contest_entries').insertOne({
        contestId: new ObjectId(contestId),
        userId,
        userDisplayName: '테스트유저',
        userProfileImageFileName: null,
        photoFileName: 'contest/test-photo.jpg',
        description: '귀여운 파이리',
        voteCount: 0,
        rank: null,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    });
    return { entryId: result.insertedId.toString() };
}

async function seedContestVote(
    app: INestApplication,
    contestId: string,
    entryId: string,
    voterId: string,
): Promise<void> {
    const conn = app.get<Connection>(getConnectionToken());
    await conn.collection('contest_votes').insertOne({
        contestId: new ObjectId(contestId),
        entryId: new ObjectId(entryId),
        voterId,
        createdAt: new Date(),
    });
    await conn.collection('contest_entries').updateOne({ _id: new ObjectId(entryId) }, { $inc: { voteCount: 1 } });
}

// ─── E2E 테스트 ──────────────────────────────────────────────────────────────

describe('콘테스트 E2E 테스트', () => {
    let app: INestApplication;
    let user1Token: string;
    let user1Id: string;
    let user2Token: string;
    let user2Id: string;
    let adminToken: string;

    beforeAll(async () => {
        app = await createTestingApp();

        // StorageService signed URL mock
        const storageService = app.get(StorageService);
        jest.spyOn(storageService, 'generateSignedUrl').mockImplementation(
            (fileName: string) => `https://cdn.test/${fileName}`,
        );

        // v2 등록에 필요한 약관 시드
        await seedRequiredTerms(app);

        // 유저 2명 등록
        const adopter1 = await registerAdopterV2(app);
        const adopter2 = await registerAdopterV2(app);
        expect(adopter1).not.toBeNull();
        expect(adopter2).not.toBeNull();

        user1Token = adopter1!.token;
        user1Id = adopter1!.adopterId;
        user2Token = adopter2!.token;
        user2Id = adopter2!.adopterId;

        adminToken = (await getAdminToken(app))!;
    }, 60000);

    afterAll(async () => {
        await closeTestingApp(app);
    });

    // ── 콘테스트 없을 때 ────────────────────────────────────────────────────

    describe('공개 API — 진행 중인 콘테스트 없음', () => {
        it('GET /current → data: null', async () => {
            const res = await request(app.getHttpServer()).get('/api/v2/contest/current').expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeNull();
        });

        it('GET /entries → 400 (진행 중 콘테스트 없음)', async () => {
            await request(app.getHttpServer()).get('/api/v2/contest/entries').expect(400);
        });

        it('GET /yesterday-top → data: null', async () => {
            const res = await request(app.getHttpServer()).get('/api/v2/contest/yesterday-top').expect(200);

            expect(res.body.data).toBeNull();
        });

        it('GET /previous-ranking → data: null', async () => {
            const res = await request(app.getHttpServer()).get('/api/v2/contest/previous-ranking').expect(200);

            expect(res.body.data).toBeNull();
        });

        it('GET /weekly-top → data: null', async () => {
            const res = await request(app.getHttpServer()).get('/api/v2/contest/weekly-top').expect(200);

            expect(res.body.data).toBeNull();
        });

        it('GET /hall-of-fame → 빈 목록', async () => {
            const res = await request(app.getHttpServer()).get('/api/v2/contest/hall-of-fame').expect(200);

            expect(res.body.data.items).toHaveLength(0);
        });
    });

    // ── 콘테스트 있을 때 ────────────────────────────────────────────────────

    describe('진행 중인 콘테스트 있을 때', () => {
        let contestId: string;

        beforeAll(async () => {
            await seedEndedContest(app);
            const { contestId: id } = await seedContest(app);
            contestId = id;
        });

        // ─── 공개 API ─────────────────────────────────────────────────────

        it('GET /current → 콘테스트 정보 반환', async () => {
            const res = await request(app.getHttpServer()).get('/api/v2/contest/current').expect(200);

            expect(res.body.data.contest.title).toBe('이번주 명예의 전당');
            expect(res.body.data.ranking).toHaveLength(0);
            expect(res.body.data.hasEntry).toBe(false);
        });

        it('GET /current 인증 유저 → hasEntry·myVotedEntryId 포함', async () => {
            const res = await request(app.getHttpServer())
                .get('/api/v2/contest/current')
                .set('Authorization', `Bearer ${user1Token}`)
                .expect(200);

            expect(res.body.data.hasEntry).toBe(false);
            expect(res.body.data.myVotedEntryId).toBeNull();
        });

        it('GET /entries → 빈 목록', async () => {
            const res = await request(app.getHttpServer()).get('/api/v2/contest/entries').expect(200);

            expect(res.body.data.items).toHaveLength(0);
            expect(res.body.data.pagination.totalItems).toBe(0);
        });

        it('GET /yesterday-top → 콘테스트 ID + 빈 랭킹', async () => {
            const res = await request(app.getHttpServer()).get('/api/v2/contest/yesterday-top').expect(200);

            expect(res.body.data.contestId).toBe(contestId);
            expect(res.body.data.ranking).toHaveLength(0);
        });

        it('GET /previous-ranking → 종료 콘테스트 반환', async () => {
            const res = await request(app.getHttpServer()).get('/api/v2/contest/previous-ranking').expect(200);

            expect(res.body.data.contest.title).toBe('저번주 명예의 전당');
        });

        it('GET /weekly-top → 종료 콘테스트 반환, topEntries 빈 배열', async () => {
            const res = await request(app.getHttpServer()).get('/api/v2/contest/weekly-top').expect(200);

            expect(res.body.data.weekKey).toMatch(/^\d{4}-W\d{2}$/);
            expect(res.body.data.topEntries).toHaveLength(0);
            expect(res.body.data.calculatedAt).toBeDefined();
        });

        // ─── 참여 (user1) ──────────────────────────────────────────────────

        describe('콘테스트 참여 (user1)', () => {
            let entryId: string;

            it('POST /entry 인증 없음 → 401', async () => {
                await request(app.getHttpServer())
                    .post('/api/v2/contest/entry')
                    .send({ photoFileName: 'contest/photo.jpg', description: '귀여운 아이' })
                    .expect(401);
            });

            it('POST /entry 성공 → entryId 반환', async () => {
                const res = await request(app.getHttpServer())
                    .post('/api/v2/contest/entry')
                    .set('Authorization', `Bearer ${user1Token}`)
                    .send({ photoFileName: 'contest/photo.jpg', description: '귀여운 파이리' })
                    .expect(200);

                expect(res.body.data.entryId).toBeDefined();
                entryId = res.body.data.entryId;
            });

            it('POST /entry 중복 참여 → 400', async () => {
                await request(app.getHttpServer())
                    .post('/api/v2/contest/entry')
                    .set('Authorization', `Bearer ${user1Token}`)
                    .send({ photoFileName: 'contest/photo2.jpg', description: '두 번째 시도' })
                    .expect(400);
            });

            it('GET /me → 내 참여 항목 반환', async () => {
                const res = await request(app.getHttpServer())
                    .get('/api/v2/contest/me/entry')
                    .set('Authorization', `Bearer ${user1Token}`)
                    .expect(200);

                expect(res.body.data.id).toBe(entryId);
                expect(res.body.data.isMyEntry).toBe(true);
            });

            it('GET /current → hasEntry: true', async () => {
                const res = await request(app.getHttpServer())
                    .get('/api/v2/contest/current')
                    .set('Authorization', `Bearer ${user1Token}`)
                    .expect(200);

                expect(res.body.data.hasEntry).toBe(true);
            });

            // ─── 투표 (user2) ────────────────────────────────────────────────

            describe('투표 (user2 → user1 항목)', () => {
                it('GET /random-entry user1 → entry: null (본인 항목만 존재)', async () => {
                    const res = await request(app.getHttpServer())
                        .get('/api/v2/contest/random-entry')
                        .set('Authorization', `Bearer ${user1Token}`)
                        .expect(200);

                    expect(res.body.data.entry).toBeNull();
                    expect(res.body.data.alreadyVoted).toBe(false);
                });

                it('GET /random-entry user2 → user1 항목 반환, voteCount: null', async () => {
                    const res = await request(app.getHttpServer())
                        .get('/api/v2/contest/random-entry')
                        .set('Authorization', `Bearer ${user2Token}`)
                        .expect(200);

                    expect(res.body.data.alreadyVoted).toBe(false);
                    expect(res.body.data.entry).not.toBeNull();
                    expect(res.body.data.entry.voteCount).toBeNull();
                });

                it('POST /vote/:entryId 자신 항목 → 400', async () => {
                    await request(app.getHttpServer())
                        .post(`/api/v2/contest/vote/${entryId}`)
                        .set('Authorization', `Bearer ${user1Token}`)
                        .expect(400);
                });

                it('POST /vote/:entryId 인증 없음 → 401', async () => {
                    await request(app.getHttpServer()).post(`/api/v2/contest/vote/${entryId}`).expect(401);
                });

                it('POST /vote/:entryId 성공 → newVoteCount: 1', async () => {
                    const res = await request(app.getHttpServer())
                        .post(`/api/v2/contest/vote/${entryId}`)
                        .set('Authorization', `Bearer ${user2Token}`)
                        .expect(200);

                    expect(res.body.data.entryId).toBe(entryId);
                    expect(res.body.data.newVoteCount).toBe(1);
                });

                it('POST /vote/:entryId 중복 투표 → 400', async () => {
                    await request(app.getHttpServer())
                        .post(`/api/v2/contest/vote/${entryId}`)
                        .set('Authorization', `Bearer ${user2Token}`)
                        .expect(400);
                });

                it('GET /entries user2 → 투표한 항목만 voteCount 공개', async () => {
                    const res = await request(app.getHttpServer())
                        .get('/api/v2/contest/entries')
                        .set('Authorization', `Bearer ${user2Token}`)
                        .expect(200);

                    const votedEntry = res.body.data.items.find((i: any) => i.id === entryId);
                    expect(votedEntry.voteCount).toBe(1);
                    expect(votedEntry.hasVoted).toBe(true);
                });

                it('GET /entries user1 → voteCount: null (투표 안 함)', async () => {
                    const res = await request(app.getHttpServer())
                        .get('/api/v2/contest/entries')
                        .set('Authorization', `Bearer ${user1Token}`)
                        .expect(200);

                    const myEntry = res.body.data.items.find((i: any) => i.id === entryId);
                    expect(myEntry.voteCount).toBeNull();
                });

                it('GET /random-entry user2 투표 후 → alreadyVoted: true', async () => {
                    const res = await request(app.getHttpServer())
                        .get('/api/v2/contest/random-entry')
                        .set('Authorization', `Bearer ${user2Token}`)
                        .expect(200);

                    expect(res.body.data.alreadyVoted).toBe(true);
                    expect(res.body.data.entry).toBeNull();
                });

                it('GET /yesterday-top → voteRate 계산됨', async () => {
                    const res = await request(app.getHttpServer()).get('/api/v2/contest/yesterday-top').expect(200);

                    expect(res.body.data.ranking).toHaveLength(1);
                    expect(res.body.data.ranking[0].rank).toBe(1);
                    expect(typeof res.body.data.ranking[0].voteRate).toBe('number');
                });

                // ─── 투표 취소 (user2) ─────────────────────────────────────────
                // 종료 시점 상태를 취소 전과 동일(user2 가 entryId 에 1표)하게 되돌려
                // 이후 관리자 API 테스트에 영향을 주지 않는다.

                describe('투표 취소 (user2)', () => {
                    it('DELETE /vote/:entryId 인증 없음 → 401', async () => {
                        await request(app.getHttpServer()).delete(`/api/v2/contest/vote/${entryId}`).expect(401);
                    });

                    it('DELETE /vote/:entryId 투표 안 한 유저(user1) → 400', async () => {
                        const res = await request(app.getHttpServer())
                            .delete(`/api/v2/contest/vote/${entryId}`)
                            .set('Authorization', `Bearer ${user1Token}`)
                            .expect(400);

                        expect(res.body.error).toContain('투표한 내역이 없습니다');
                    });

                    it('DELETE /vote/:entryId 존재하지 않는 항목 → 400', async () => {
                        await request(app.getHttpServer())
                            .delete(`/api/v2/contest/vote/${new ObjectId().toString()}`)
                            .set('Authorization', `Bearer ${user2Token}`)
                            .expect(400);
                    });

                    it('DELETE /vote/:entryId 내가 투표하지 않은 다른 항목 → 400', async () => {
                        const conn = app.get<Connection>(getConnectionToken());
                        const { entryId: otherEntryId } = await seedContestEntry(app, contestId, 'other-user-id');

                        try {
                            const res = await request(app.getHttpServer())
                                .delete(`/api/v2/contest/vote/${otherEntryId}`)
                                .set('Authorization', `Bearer ${user2Token}`)
                                .expect(400);

                            expect(res.body.error).toContain('해당 항목에 투표한 내역이 없습니다');
                        } finally {
                            // 단정 실패 여부와 무관하게 임시 항목을 제거해 이후 entries 카운트 테스트를 보호한다
                            await conn.collection('contest_entries').deleteOne({ _id: new ObjectId(otherEntryId) });
                        }
                    });

                    it('DELETE /vote/:entryId 성공 → newVoteCount: 0', async () => {
                        const res = await request(app.getHttpServer())
                            .delete(`/api/v2/contest/vote/${entryId}`)
                            .set('Authorization', `Bearer ${user2Token}`)
                            .expect(200);

                        expect(res.body.data.entryId).toBe(entryId);
                        expect(res.body.data.newVoteCount).toBe(0);
                    });

                    it('중복 취소 → 400', async () => {
                        await request(app.getHttpServer())
                            .delete(`/api/v2/contest/vote/${entryId}`)
                            .set('Authorization', `Bearer ${user2Token}`)
                            .expect(400);
                    });

                    it('취소 후 GET /entries user2 → voteCount 비공개, hasVoted: false', async () => {
                        const res = await request(app.getHttpServer())
                            .get('/api/v2/contest/entries')
                            .set('Authorization', `Bearer ${user2Token}`)
                            .expect(200);

                        const votedEntry = res.body.data.items.find((i: any) => i.id === entryId);
                        expect(votedEntry.voteCount).toBeNull();
                        expect(votedEntry.hasVoted).toBe(false);
                    });

                    it('취소 후 GET /random-entry user2 → alreadyVoted: false (재투표 가능)', async () => {
                        const res = await request(app.getHttpServer())
                            .get('/api/v2/contest/random-entry')
                            .set('Authorization', `Bearer ${user2Token}`)
                            .expect(200);

                        expect(res.body.data.alreadyVoted).toBe(false);
                    });

                    it('취소 후 재투표 성공 → newVoteCount: 1 (unique index 재투표 허용 확인)', async () => {
                        const res = await request(app.getHttpServer())
                            .post(`/api/v2/contest/vote/${entryId}`)
                            .set('Authorization', `Bearer ${user2Token}`)
                            .expect(200);

                        expect(res.body.data.newVoteCount).toBe(1);
                    });
                });

                // ─── 관리자 API ────────────────────────────────────────────────

                describe('관리자 항목 상태 변경', () => {
                    it('일반 유저 PATCH → 403', async () => {
                        await request(app.getHttpServer())
                            .patch(`/api/contest-admin/entries/${entryId}/status`)
                            .set('Authorization', `Bearer ${user1Token}`)
                            .send({ status: 'hidden' })
                            .expect(403);
                    });

                    it('잘못된 status 값 → 400', async () => {
                        await request(app.getHttpServer())
                            .patch(`/api/contest-admin/entries/${entryId}/status`)
                            .set('Authorization', `Bearer ${adminToken}`)
                            .send({ status: 'active' })
                            .expect(400);
                    });

                    it('관리자 → hidden 성공', async () => {
                        const res = await request(app.getHttpServer())
                            .patch(`/api/contest-admin/entries/${entryId}/status`)
                            .set('Authorization', `Bearer ${adminToken}`)
                            .send({ status: 'hidden' })
                            .expect(200);

                        expect(res.body.success).toBe(true);
                    });

                    it('hidden 항목은 공개 entries에서 제외', async () => {
                        const res = await request(app.getHttpServer()).get('/api/v2/contest/entries').expect(200);

                        expect(res.body.data.items.find((i: any) => i.id === entryId)).toBeUndefined();
                        expect(res.body.data.pagination.totalItems).toBe(0);
                    });

                    it('관리자 → deleted 성공', async () => {
                        await request(app.getHttpServer())
                            .patch(`/api/contest-admin/entries/${entryId}/status`)
                            .set('Authorization', `Bearer ${adminToken}`)
                            .send({ status: 'deleted' })
                            .expect(200);
                    });

                    it('deleted 항목 재변경 → 400', async () => {
                        await request(app.getHttpServer())
                            .patch(`/api/contest-admin/entries/${entryId}/status`)
                            .set('Authorization', `Bearer ${adminToken}`)
                            .send({ status: 'hidden' })
                            .expect(400);
                    });
                });
            });
        });
    });

    // ── weekly-top: 종료 콘테스트에 항목 있을 때 ────────────────────────────

    describe('종료 콘테스트에 항목 있을 때 — weekly-top', () => {
        beforeAll(async () => {
            const { contestId } = await seedContest(app, {
                title: '지난주 명예의 전당',
                status: 'ended',
                startDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            });
            await seedContestEntry(app, contestId, user1Id, { voteCount: 10, rank: 1 });
            await seedContestEntry(app, contestId, user2Id, { voteCount: 7, rank: 2 });
        });

        it('GET /weekly-top → weekKey 형식 YYYY-WXX', async () => {
            const res = await request(app.getHttpServer()).get('/api/v2/contest/weekly-top').expect(200);

            expect(res.body.data.weekKey).toMatch(/^\d{4}-W\d{2}$/);
        });

        it('GET /weekly-top → topEntries 최대 3개, voteCount 내림차순', async () => {
            const res = await request(app.getHttpServer()).get('/api/v2/contest/weekly-top').expect(200);

            const { topEntries } = res.body.data;
            expect(topEntries.length).toBeGreaterThan(0);
            expect(topEntries.length).toBeLessThanOrEqual(3);
            if (topEntries.length >= 2) {
                expect(topEntries[0].voteCount).toBeGreaterThanOrEqual(topEntries[1].voteCount);
            }
        });

        it('GET /weekly-top → topEntries 항목 필드 존재', async () => {
            const res = await request(app.getHttpServer()).get('/api/v2/contest/weekly-top').expect(200);

            const entry = res.body.data.topEntries[0];
            expect(entry).toHaveProperty('id');
            expect(entry).toHaveProperty('photoUrl');
            expect(entry).toHaveProperty('rank');
            expect(typeof entry.voteCount).toBe('number');
        });

        it('GET /weekly-top → calculatedAt ISO 문자열', async () => {
            const res = await request(app.getHttpServer()).get('/api/v2/contest/weekly-top').expect(200);

            expect(new Date(res.body.data.calculatedAt).toString()).not.toBe('Invalid Date');
        });
    });

    // ── 종료된 콘테스트 — 결과 확정 후 투표/취소 차단 ───────────────────────
    // 종료 후 투표·취소가 허용되면 명예의 전당/랭킹 확정 결과를 변조할 수 있다.

    describe('종료된 콘테스트 — 투표/취소 차단', () => {
        let endedEntryId: string;

        beforeAll(async () => {
            const { contestId: endedContestId } = await seedContest(app, {
                title: '종료된 명예의 전당',
                status: 'ended',
                startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            });
            const { entryId } = await seedContestEntry(app, endedContestId, user1Id, { rank: 1 });
            endedEntryId = entryId;
            // user2 가 종료 전에 투표해 둔 상태를 재현 (voteCount: 1)
            await seedContestVote(app, endedContestId, entryId, user2Id);
        });

        it('POST /vote/:entryId 종료된 콘테스트 → 400', async () => {
            const res = await request(app.getHttpServer())
                .post(`/api/v2/contest/vote/${endedEntryId}`)
                .set('Authorization', `Bearer ${user2Token}`)
                .expect(400);

            expect(res.body.error).toContain('종료된 콘테스트에는 투표할 수 없습니다');
        });

        it('DELETE /vote/:entryId 종료된 콘테스트 → 400, voteCount 불변', async () => {
            const res = await request(app.getHttpServer())
                .delete(`/api/v2/contest/vote/${endedEntryId}`)
                .set('Authorization', `Bearer ${user2Token}`)
                .expect(400);

            expect(res.body.error).toContain('종료된 콘테스트의 투표는 취소할 수 없습니다');

            // 확정된 집계가 실제로 변하지 않았는지 DB 로 확인
            const conn = app.get<Connection>(getConnectionToken());
            const doc = await conn.collection('contest_entries').findOne({ _id: new ObjectId(endedEntryId) });
            expect(doc?.voteCount).toBe(1);
        });
    });

    // ── 지연 종료 — status 는 active 지만 endDate 가 지난 콘테스트 ──────────
    // 스케줄러/운영이 status 를 늦게 바꿔도 endDate 기준으로 투표·취소를 차단해야
    // 종료 시점 전후의 경쟁으로 확정 결과가 변조되지 않는다.

    describe('지연 종료 콘테스트 — endDate 기준 차단', () => {
        let expiredContestId: string;
        let expiredEntryId: string;

        beforeAll(async () => {
            const seeded = await seedContest(app, {
                title: '만료됐지만 아직 active 인 콘테스트',
                status: 'active',
                startDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() - 60 * 1000),
            });
            expiredContestId = seeded.contestId;
            const { entryId } = await seedContestEntry(app, expiredContestId, user1Id);
            expiredEntryId = entryId;
            // user2 가 마감 전에 투표해 둔 상태를 재현 (voteCount: 1)
            await seedContestVote(app, expiredContestId, entryId, user2Id);
        });

        it('POST /vote/:entryId endDate 경과 → 400 + 콘테스트가 ended 로 확정됨(자기 치유)', async () => {
            const res = await request(app.getHttpServer())
                .post(`/api/v2/contest/vote/${expiredEntryId}`)
                .set('Authorization', `Bearer ${user2Token}`)
                .expect(400);

            expect(res.body.error).toContain('종료된 콘테스트에는 투표할 수 없습니다');

            // 만료된 active 콘테스트를 감지한 순간 status 가 ended 로 쓰였는지 확인.
            // 이 "쓰기"가 있어야 이후의 모든 투표/취소 게이트가 확정 상태와 직렬화된다.
            const conn = app.get<Connection>(getConnectionToken());
            const contestDoc = await conn.collection('contests').findOne({ _id: new ObjectId(expiredContestId) });
            expect(contestDoc?.status).toBe('ended');
        });

        it('DELETE /vote/:entryId endDate 경과 → 400, voteCount 불변', async () => {
            const res = await request(app.getHttpServer())
                .delete(`/api/v2/contest/vote/${expiredEntryId}`)
                .set('Authorization', `Bearer ${user2Token}`)
                .expect(400);

            expect(res.body.error).toContain('종료된 콘테스트의 투표는 취소할 수 없습니다');

            const conn = app.get<Connection>(getConnectionToken());
            const doc = await conn.collection('contest_entries').findOne({ _id: new ObjectId(expiredEntryId) });
            expect(doc?.voteCount).toBe(1);
        });
    });
});
