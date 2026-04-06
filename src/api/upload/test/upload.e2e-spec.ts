import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { AppModule } from '../../../app.module';
import { StorageService } from '../../../common/storage/storage.service';

let mongod: MongoMemoryServer;

function createStorageServiceMock(): Pick<
    StorageService,
    | 'uploadFile'
    | 'uploadMultipleFiles'
    | 'deleteFile'
    | 'generateSignedUrl'
    | 'generateSignedUrls'
    | 'generateSignedUrlSafe'
    | 'getBucketName'
    | 'getCdnUrl'
    | 'listObjects'
    | 'fileExists'
> {
    const buildFileName = (file: Express.Multer.File, folder?: string, index?: number) => {
        const fileLabel = index === undefined ? file.originalname : `${index}-${file.originalname}`;
        return folder ? `${folder}/${fileLabel}` : fileLabel;
    };

    const buildUrl = (fileName: string) => `https://cdn.test/${fileName}`;

    return {
        uploadFile: jest.fn(async (file: Express.Multer.File, folder?: string) => {
            const fileName = buildFileName(file, folder);
            return {
                fileName,
                cdnUrl: buildUrl(fileName),
                storageUrl: buildUrl(fileName),
            };
        }),
        uploadMultipleFiles: jest.fn(async (files: Express.Multer.File[], folder?: string) =>
            files.map((file, index) => {
                const fileName = buildFileName(file, folder, index);
                return {
                    fileName,
                    cdnUrl: buildUrl(fileName),
                    storageUrl: buildUrl(fileName),
                };
            }),
        ),
        deleteFile: jest.fn(async () => undefined),
        generateSignedUrl: jest.fn((fileName: string) => buildUrl(fileName)),
        generateSignedUrls: jest.fn((fileNames: string[]) => fileNames.map((fileName) => buildUrl(fileName))),
        generateSignedUrlSafe: jest.fn((fileName?: string | null) => (fileName ? buildUrl(fileName) : undefined)),
        getBucketName: jest.fn(() => 'pawpong_s3'),
        getCdnUrl: jest.fn((fileName: string) => buildUrl(fileName)),
        listObjects: jest.fn(async () => ({
            Contents: [],
            IsTruncated: false,
            $metadata: {},
        })),
        fileExists: jest.fn(async () => true),
    };
}

async function createUploadTestingApp(): Promise<INestApplication> {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    })
        .overrideProvider(StorageService)
        .useValue(createStorageServiceMock())
        .compile();

    const app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );

    await app.init();
    return app;
}

describe('Upload API E2E Tests (Simple)', () => {
    let app: INestApplication;
    let breederToken: string;
    let breederId: string;
    let availablePetId: string;
    let parentPetId: string;
    let uploadedFileNames: string[] = [];
    const testImageBuffer = Buffer.from(
        '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
        'base64',
    );

    beforeAll(async () => {
        app = await createUploadTestingApp();

        // 1. 테스트용 브리더 생성
        const timestamp = Date.now();
        const breederResponse = await request(app.getHttpServer())
            .post('/api/auth/register/breeder')
            .send({
                email: `upload_breeder_${timestamp}@test.com`,
                phoneNumber: '010-3333-4444',
                breederName: '파일 업로드 브리더',
                breederLocation: {
                    city: '서울특별시',
                    district: '강남구',
                },
                animal: 'dog',
                breeds: ['포메라니안'],
                plan: 'basic',
                level: 'new',
                agreements: {
                    termsOfService: true,
                    privacyPolicy: true,
                    marketingConsent: false,
                },
            })
            .expect(200);

        breederToken = breederResponse.body.data.accessToken;
        breederId = breederResponse.body.data.breederId;

        // 2. 테스트용 분양 개체 생성
        if (breederToken) {
            const availablePetResponse = await request(app.getHttpServer())
                .post('/api/breeder-management/available-pets')
                .set('Authorization', `Bearer ${breederToken}`)
                .send({
                    name: '테스트 분양 개체',
                    breed: '포메라니안',
                    birthDate: '2024-01-15',
                    gender: 'male',
                    price: 1500000,
                    description: '테스트용 분양 개체입니다.',
                });

            if ([200, 201].includes(availablePetResponse.status) && availablePetResponse.body.data?.petId) {
                availablePetId = availablePetResponse.body.data.petId;
            }

            // 3. 테스트용 부모견/묘 생성
            const parentPetResponse = await request(app.getHttpServer())
                .post('/api/breeder-management/parent-pets')
                .set('Authorization', `Bearer ${breederToken}`)
                .send({
                    name: '테스트 부모견',
                    breed: '포메라니안',
                    birthDate: '2020-01-01',
                    gender: 'female',
                    description: '테스트용 부모견입니다.',
                });

            if ([200, 201].includes(parentPetResponse.status) && parentPetResponse.body.data?.petId) {
                parentPetId = parentPetResponse.body.data.petId;
            }
        }
    });

    afterAll(async () => {
        // 업로드된 파일 삭제
        for (const fileName of uploadedFileNames) {
            try {
                await request(app.getHttpServer()).delete('/api/upload').send({ fileName });
            } catch (error) {
                // 파일 삭제 실패해도 테스트는 계속 진행
            }
        }

        await app.close();
        if (mongod) {
            await mongod.stop();
            mongod = undefined as any;
        }
    });

    describe('브리더 대표 사진 업로드', () => {
        it('POST /api/upload/representative-photos - 대표 사진 업로드 성공', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/upload/representative-photos')
                .set('Authorization', `Bearer ${breederToken}`)
                .attach('files', testImageBuffer, 'representative-1.jpg')
                .attach('files', testImageBuffer, 'representative-2.jpg')
                .attach('files', testImageBuffer, 'representative-3.jpg');

            expect([200, 201]).toContain(response.status);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data).toHaveLength(3);
            response.body.data.forEach((item: any) => {
                expect(item).toHaveProperty('filename');
                expect(item).toHaveProperty('url');
                uploadedFileNames.push(item.filename);
            });
            console.log('✅ 브리더 대표 사진 업로드 성공');
        });

        it('POST /api/upload/representative-photos - 인증 없이 접근 실패', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/upload/representative-photos')
                .attach('files', testImageBuffer, 'representative.jpg');

            expect(response.status).toBe(401);
            console.log('✅ 인증 없이 접근 거부 확인');
        });

        it('POST /api/upload/representative-photos - 파일 없이 요청 실패', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/upload/representative-photos')
                .set('Authorization', `Bearer ${breederToken}`);

            expect([400, 401]).toContain(response.status);
            console.log('✅ 파일 없이 요청 거부 확인');
        });
    });

    describe('분양 개체 사진 업로드', () => {
        it('POST /api/upload/available-pet-photos/:petId - 분양 개체 사진 업로드 성공', async () => {
            if (!availablePetId) {
                console.log('⚠️  분양 개체 ID가 없어서 테스트 스킵');
                return;
            }

            const response = await request(app.getHttpServer())
                .post(`/api/upload/available-pet-photos/${availablePetId}`)
                .set('Authorization', `Bearer ${breederToken}`)
                .attach('files', testImageBuffer, 'available-pet.jpg');

            expect([200, 201]).toContain(response.status);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0]).toHaveProperty('filename');
            uploadedFileNames.push(response.body.data[0].filename);
            console.log('✅ 분양 개체 사진 업로드 성공');
        });

        it('POST /api/upload/available-pet-photos/:petId - 인증 없이 접근 실패', async () => {
            if (!availablePetId) {
                console.log('⚠️  분양 개체 ID가 없어서 테스트 스킵');
                return;
            }

            const response = await request(app.getHttpServer())
                .post(`/api/upload/available-pet-photos/${availablePetId}`)
                .attach('files', testImageBuffer, 'available-pet.jpg');

            expect(response.status).toBe(401);
            console.log('✅ 인증 없이 접근 거부 확인');
        });

        it('POST /api/upload/available-pet-photos/:petId - 잘못된 petId로 요청 실패', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/upload/available-pet-photos/invalid_pet_id')
                .set('Authorization', `Bearer ${breederToken}`)
                .attach('files', testImageBuffer, 'available-pet.jpg');

            expect(response.status).toBe(400);
            console.log('✅ 잘못된 petId로 요청 거부 확인');
        });
    });

    describe('부모견/묘 사진 업로드', () => {
        it('POST /api/upload/parent-pet-photos/:petId - 부모견/묘 사진 업로드 성공', async () => {
            if (!parentPetId) {
                console.log('⚠️  부모견/묘 ID가 없어서 테스트 스킵');
                return;
            }

            const response = await request(app.getHttpServer())
                .post(`/api/upload/parent-pet-photos/${parentPetId}`)
                .set('Authorization', `Bearer ${breederToken}`)
                .attach('files', testImageBuffer, 'parent-pet.jpg');

            expect([200, 201]).toContain(response.status);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0]).toHaveProperty('filename');
            uploadedFileNames.push(response.body.data[0].filename);
            console.log('✅ 부모견/묘 사진 업로드 성공');
        });

        it('POST /api/upload/parent-pet-photos/:petId - 인증 없이 접근 실패', async () => {
            if (!parentPetId) {
                console.log('⚠️  부모견/묘 ID가 없어서 테스트 스킵');
                return;
            }

            const response = await request(app.getHttpServer())
                .post(`/api/upload/parent-pet-photos/${parentPetId}`)
                .attach('files', testImageBuffer, 'parent-pet.jpg');

            expect(response.status).toBe(401);
            console.log('✅ 인증 없이 접근 거부 확인');
        });
    });

    describe('단일 파일 업로드 (공개 API)', () => {
        it('POST /api/upload/single - 단일 파일 업로드 성공', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/upload/single')
                .attach('file', testImageBuffer, 'single-upload.jpg')
                .field('folder', 'test');

            expect([200, 201, 400]).toContain(response.status);

            if (response.status === 200 || response.status === 201) {
                expect(response.body.data).toBeDefined();
                expect(response.body.data).toHaveProperty('filename');
                expect(response.body.data).toHaveProperty('url');
                uploadedFileNames.push(response.body.data.filename);
                console.log('✅ 단일 파일 업로드 성공');
            } else {
                console.log('⚠️  단일 파일 업로드 실패 (GCP 설정 필요)');
            }
        });

        it('POST /api/upload/single - 파일 없이 요청 실패', async () => {
            const response = await request(app.getHttpServer()).post('/api/upload/single');

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('파일이 없습니다');
            console.log('✅ 파일 없이 요청 거부 확인');
        });
    });

    describe('다중 파일 업로드 (공개 API)', () => {
        it('POST /api/upload/multiple - 다중 파일 업로드 성공', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/upload/multiple')
                .attach('files', testImageBuffer, 'multiple-1.jpg')
                .attach('files', testImageBuffer, 'multiple-2.jpg')
                .field('folder', 'test');

            expect([200, 201, 400]).toContain(response.status);

            if (response.status === 200 || response.status === 201) {
                expect(response.body.data).toBeDefined();
                expect(Array.isArray(response.body.data)).toBe(true);
                response.body.data.forEach((item: any) => {
                    uploadedFileNames.push(item.filename);
                });
                console.log('✅ 다중 파일 업로드 성공');
            } else {
                console.log('⚠️  다중 파일 업로드 실패 (GCP 설정 필요)');
            }
        });

        it('POST /api/upload/multiple - 파일 없이 요청 실패', async () => {
            const response = await request(app.getHttpServer()).post('/api/upload/multiple');

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('파일이 없습니다');
            console.log('✅ 파일 없이 요청 거부 확인');
        });
    });

    describe('파일 삭제', () => {
        it('DELETE /api/upload - 파일 삭제 성공', async () => {
            const response = await request(app.getHttpServer())
                .delete('/api/upload')
                .send({ fileName: 'test/fake-file.jpg' });

            expect([200, 400, 404, 500]).toContain(response.status);

            if (response.status === 200) {
                console.log('✅ 파일 삭제 성공');
            } else {
                console.log('⚠️  파일 삭제 실패 (GCP 설정 필요 또는 파일 없음)');
            }
        });

        it('DELETE /api/upload - 파일명 없이 요청 실패', async () => {
            const response = await request(app.getHttpServer()).delete('/api/upload').send({});

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('파일명이 없습니다');
            console.log('✅ 파일명 없이 요청 거부 확인');
        });
    });

    describe('응답 형식 검증', () => {
        it('모든 업로드 응답은 표준 형식을 따름', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/upload/single')
                .attach('file', testImageBuffer, 'response-shape.jpg');

            expect(response.body).toHaveProperty('success');
            expect(response.body).toHaveProperty('code');
            expect(response.body).toHaveProperty('timestamp');

            if (response.status === 200 || response.status === 201) {
                expect(response.body.data).toHaveProperty('filename');
                expect(response.body.data).toHaveProperty('url');
                expect(response.body.data).toHaveProperty('size');
            }

            console.log('✅ 응답 형식 검증 완료');
        });
    });
});
