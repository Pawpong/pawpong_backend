import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestingApp } from '../../../../common/test/test-utils';

describe('필터 옵션 종단간 테스트', () => {
    let app: INestApplication;

    beforeAll(async () => {
        app = await createTestingApp();
    }, 30000);

    afterAll(async () => {
        await app.close();
    });

    describe('GET /api/filter-options', () => {
        it('전체 필터 옵션 조회 성공', async () => {
            const response = await request(app.getHttpServer()).get('/api/filter-options').expect(200);

            expect(response.body).toEqual({
                success: true,
                code: 200,
                data: {
                    breederLevels: [
                        {
                            value: 'elite',
                            label: '엘리트',
                            description: '인증된 전문 브리더',
                        },
                        {
                            value: 'new',
                            label: '뉴',
                            description: '신규 브리더',
                        },
                    ],
                    sortOptions: [
                        {
                            value: 'latest',
                            label: '최신순',
                            description: '최근 등록된 브리더순',
                        },
                        {
                            value: 'favorite',
                            label: '찜 많은순',
                            description: '찜이 많은 브리더순',
                        },
                        {
                            value: 'review',
                            label: '후기 많은순',
                            description: '후기가 많은 브리더순',
                        },
                        {
                            value: 'price_asc',
                            label: '오름차순',
                            description: '분양가가 낮은 브리더순',
                        },
                        {
                            value: 'price_desc',
                            label: '내림차순',
                            description: '분양가가 높은 브리더순',
                        },
                    ],
                    dogSizes: [
                        {
                            value: 'small',
                            label: '소형견',
                            description: '10kg 미만',
                        },
                        {
                            value: 'medium',
                            label: '중형견',
                            description: '10kg ~ 25kg',
                        },
                        {
                            value: 'large',
                            label: '대형견',
                            description: '25kg 이상',
                        },
                    ],
                    catFurLengths: [
                        {
                            value: 'short',
                            label: '단모',
                            description: '짧은 털',
                        },
                        {
                            value: 'long',
                            label: '장모',
                            description: '긴 털',
                        },
                    ],
                    adoptionStatus: [
                        {
                            value: true,
                            label: '입양 가능',
                            description: '현재 입양 가능한 반려동물이 있는 브리더',
                        },
                    ],
                },
                message: '필터 옵션이 조회되었습니다.',
                timestamp: expect.any(String),
            });
        });
    });

    describe('GET /api/filter-options/breeder-levels', () => {
        it('브리더 레벨 옵션 조회 성공', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/filter-options/breeder-levels')
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                code: 200,
                data: [
                    {
                        value: 'elite',
                        label: '엘리트',
                        description: '인증된 전문 브리더',
                    },
                    {
                        value: 'new',
                        label: '뉴',
                        description: '신규 브리더',
                    },
                ],
                message: '브리더 레벨 옵션이 조회되었습니다.',
                timestamp: expect.any(String),
            });
        });
    });

    describe('GET /api/filter-options/sort-options', () => {
        it('정렬 옵션 조회 성공', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/filter-options/sort-options')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.code).toBe(200);
            expect(response.body.message).toBe('정렬 옵션이 조회되었습니다.');
            expect(response.body.data).toEqual([
                {
                    value: 'latest',
                    label: '최신순',
                    description: '최근 등록된 브리더순',
                },
                {
                    value: 'favorite',
                    label: '찜 많은순',
                    description: '찜이 많은 브리더순',
                },
                {
                    value: 'review',
                    label: '후기 많은순',
                    description: '후기가 많은 브리더순',
                },
                {
                    value: 'price_asc',
                    label: '오름차순',
                    description: '분양가가 낮은 브리더순',
                },
                {
                    value: 'price_desc',
                    label: '내림차순',
                    description: '분양가가 높은 브리더순',
                },
            ]);
            expect(response.body.timestamp).toEqual(expect.any(String));
        });
    });

    describe('GET /api/filter-options/dog-sizes', () => {
        it('강아지 사이즈 옵션 조회 성공', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/filter-options/dog-sizes')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.code).toBe(200);
            expect(response.body.message).toBe('강아지 크기 옵션이 조회되었습니다.');
            expect(response.body.data).toEqual([
                {
                    value: 'small',
                    label: '소형견',
                    description: '10kg 미만',
                },
                {
                    value: 'medium',
                    label: '중형견',
                    description: '10kg ~ 25kg',
                },
                {
                    value: 'large',
                    label: '대형견',
                    description: '25kg 이상',
                },
            ]);
            expect(response.body.timestamp).toEqual(expect.any(String));
        });
    });

    describe('GET /api/filter-options/cat-fur-lengths', () => {
        it('고양이 털 길이 옵션 조회 성공', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/filter-options/cat-fur-lengths')
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                code: 200,
                data: [
                    {
                        value: 'short',
                        label: '단모',
                        description: '짧은 털',
                    },
                    {
                        value: 'long',
                        label: '장모',
                        description: '긴 털',
                    },
                ],
                message: '고양이 털 길이 옵션이 조회되었습니다.',
                timestamp: expect.any(String),
            });
        });
    });

    describe('GET /api/filter-options/adoption-status', () => {
        it('입양 상태 옵션 조회 성공', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/filter-options/adoption-status')
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                code: 200,
                data: [
                    {
                        value: true,
                        label: '입양 가능',
                        description: '현재 입양 가능한 반려동물이 있는 브리더',
                    },
                ],
                message: '입양 가능 여부 옵션이 조회되었습니다.',
                timestamp: expect.any(String),
            });
        });
    });
});
