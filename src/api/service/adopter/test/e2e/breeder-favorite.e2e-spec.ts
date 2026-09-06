import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Connection } from 'mongoose';
import request from 'supertest';

import { agreeAllActiveTerms, closeTestingApp, createTestingApp } from '../../../../../common/testing/test-utils';

/**
 * 브리더가 다른 브리더를 즐겨찾기하는 경로의 회귀 테스트.
 *
 * RolesGuard 가 breeder → adopter fallback 을 허용하므로 브리더도 POST/DELETE /v2/adopter/favorite 를 호출한다.
 * 이때 컨트롤러가 role 을 유스케이스에 넘기지 않으면 브리더 id 를 adopters 컬렉션에서 찾다가
 * "입양자 정보를 찾을 수 없습니다." 로 실패한다. 저장 위치도 역할에 따라 갈리므로
 * Breeder.favoriteBreederList / Adopter.favoriteBreederList 를 각각 확인한다.
 */
/** Adopter/Breeder 문서에 임베드된 즐겨찾기 항목 */
type FavoriteEntry = { favoriteBreederId: string };

describe('브리더 즐겨찾기 종단간 테스트', () => {
    let app: INestApplication;
    let connection: Connection;

    /** 즐겨찾기를 누르는 브리더 */
    let actorBreeder: { token: string; breederId: string };
    /** 즐겨찾기 대상 브리더 */
    let targetBreederId: string;
    /** 남의 즐겨찾기가 새지 않는지 확인할 제3의 브리더 */
    let bystanderBreeder: { token: string; breederId: string };
    /** 회귀 확인용 입양자 */
    let adopter: { token: string; adopterId: string };

    const registerBreeder = async (suffix: string): Promise<{ token: string; breederId: string }> => {
        const response = await request(app.getHttpServer())
            .post('/api/v2/auth/register/breeder')
            .send({
                email: `favorite_${suffix}@test.com`,
                phoneNumber: `010-7777-${suffix.slice(-4)}`,
                breederName: `즐겨찾기브리더${suffix}`,
                breederLocation: { city: '서울특별시', district: '강남구' },
                animal: 'dog',
                breeds: ['포메라니안'],
                plan: 'basic',
                agreements: { termsOfService: true, privacyPolicy: true, marketingConsent: false },
            })
            .expect(200);

        return { token: response.body.data.accessToken, breederId: response.body.data.breederId };
    };

    const favoriteListOf = async (collection: 'breeders' | 'adopters', id: string): Promise<FavoriteEntry[]> => {
        const doc = await connection.collection(collection).findOne({ _id: new ObjectId(id) });
        return (doc?.favoriteBreederList as FavoriteEntry[] | undefined) ?? [];
    };

    const favoriteIdsOf = async (collection: 'breeders' | 'adopters', id: string): Promise<string[]> =>
        (await favoriteListOf(collection, id)).map((favorite) => favorite.favoriteBreederId);

    /** 브리더홈(GET /v2/profile/breeders/:id) 이 보는 사람 기준으로 내려주는 즐겨찾기 상태 */
    const breederHomeIsFavorited = async (viewerToken: string, breederId: string): Promise<boolean> => {
        const response = await request(app.getHttpServer())
            .get(`/api/v2/profile/breeders/${breederId}`)
            .set('Authorization', `Bearer ${viewerToken}`)
            .expect(200);
        return response.body.data.isFavorited as boolean;
    };

    beforeAll(async () => {
        app = await createTestingApp();
        connection = app.get<Connection>(getConnectionToken());

        const stamp = String(Date.now());
        actorBreeder = await registerBreeder(`actor${stamp}`);
        targetBreederId = (await registerBreeder(`target${stamp}`)).breederId;
        bystanderBreeder = await registerBreeder(`bystander${stamp}`);

        const adopterResponse = await request(app.getHttpServer())
            .post('/api/v2/auth/register/adopter')
            .send({
                tempId: `temp_kakao_favorite_${stamp}`,
                email: `favorite_adopter_${stamp}@test.com`,
                nickname: `즐겨찾기입양자${stamp}`,
                realName: '즐겨찾기입양자',
                termsAgreements: await agreeAllActiveTerms(app),
                phone: '010-1234-5678',
            })
            .expect(200);
        adopter = {
            token: adopterResponse.body.data.accessToken,
            adopterId: adopterResponse.body.data.adopterId || adopterResponse.body.data.userId,
        };
    });

    afterAll(async () => {
        await closeTestingApp(app);
    });

    describe('브리더 → 브리더', () => {
        it('즐겨찾기 추가가 성공하고 Breeder.favoriteBreederList 에 저장된다', async () => {
            await request(app.getHttpServer())
                .post('/api/v2/adopter/favorite')
                .set('Authorization', `Bearer ${actorBreeder.token}`)
                .send({ breederId: targetBreederId })
                .expect(200);

            expect(await favoriteIdsOf('breeders', actorBreeder.breederId)).toEqual([targetBreederId]);
        });

        it('마이홈 "즐겨찾는 브리더" 탭에서 조회된다', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v2/profile/me/favorite-breeders')
                .set('Authorization', `Bearer ${actorBreeder.token}`)
                .expect(200);

            expect(response.body.data.items).toHaveLength(1);
        });

        it('브리더홈을 다시 열면 isFavorited=true 로 내려온다', async () => {
            // 프론트는 이 값으로 버튼 아이콘과 호출할 API(add/remove)를 함께 결정한다.
            // false 로 내려오면 담겼는데도 빈 별이 보이고, 해제하려고 누르면 add 가 나가 409 가 된다.
            expect(await breederHomeIsFavorited(actorBreeder.token, targetBreederId)).toBe(true);
        });

        it('남의 즐겨찾기가 새지 않는다 — 제3의 브리더가 보면 false', async () => {
            expect(await breederHomeIsFavorited(bystanderBreeder.token, targetBreederId)).toBe(false);
        });

        it('같은 브리더를 다시 추가하면 409 로 막는다 (중복 방지가 브리더 문서 기준으로 동작)', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v2/adopter/favorite')
                .set('Authorization', `Bearer ${actorBreeder.token}`)
                .send({ breederId: targetBreederId })
                .expect(409);

            expect(response.body.error).toContain('이미 즐겨찾기에 추가된 브리더입니다.');
            expect(await favoriteListOf('breeders', actorBreeder.breederId)).toHaveLength(1);
        });

        it('즐겨찾기 제거가 성공하고 목록에서 빠진다', async () => {
            await request(app.getHttpServer())
                .delete(`/api/v2/adopter/favorite/${targetBreederId}`)
                .set('Authorization', `Bearer ${actorBreeder.token}`)
                .expect(200);

            expect(await favoriteListOf('breeders', actorBreeder.breederId)).toEqual([]);
        });

        it('해제한 뒤에는 브리더홈이 다시 isFavorited=false 를 내려준다', async () => {
            expect(await breederHomeIsFavorited(actorBreeder.token, targetBreederId)).toBe(false);
        });

        it('목록에 없는 브리더 제거는 400 으로 막는다', async () => {
            await request(app.getHttpServer())
                .delete(`/api/v2/adopter/favorite/${targetBreederId}`)
                .set('Authorization', `Bearer ${actorBreeder.token}`)
                .expect(400);
        });
    });

    describe('입양자 → 브리더 (회귀 방지)', () => {
        it('입양자 경로는 그대로 Adopter.favoriteBreederList 에 저장된다', async () => {
            await request(app.getHttpServer())
                .post('/api/v2/adopter/favorite')
                .set('Authorization', `Bearer ${adopter.token}`)
                .send({ breederId: targetBreederId })
                .expect(200);

            expect(await favoriteIdsOf('adopters', adopter.adopterId)).toEqual([targetBreederId]);
            // 브리더 문서에는 섞여 들어가지 않는다
            expect(await favoriteListOf('breeders', actorBreeder.breederId)).toEqual([]);
        });

        it('입양자도 브리더홈에서 isFavorited=true 를 받는다 (회귀 방지)', async () => {
            expect(await breederHomeIsFavorited(adopter.token, targetBreederId)).toBe(true);
        });

        it('입양자도 중복 추가는 409 로 막힌다', async () => {
            await request(app.getHttpServer())
                .post('/api/v2/adopter/favorite')
                .set('Authorization', `Bearer ${adopter.token}`)
                .send({ breederId: targetBreederId })
                .expect(409);
        });

        it('입양자 제거 경로도 그대로 동작한다', async () => {
            await request(app.getHttpServer())
                .delete(`/api/v2/adopter/favorite/${targetBreederId}`)
                .set('Authorization', `Bearer ${adopter.token}`)
                .expect(200);

            expect(await favoriteListOf('adopters', adopter.adopterId)).toEqual([]);
        });
    });
});
