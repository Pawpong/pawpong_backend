import { ConflictException } from '@nestjs/common';

import { CreateDistrictUseCase } from './create-district.use-case';
import { DistrictAdminPresentationService } from '../../../domain/services/district-admin-presentation.service';
import { DistrictAdminReaderPort } from '../ports/district-admin-reader.port';
import { DistrictWriterPort } from '../ports/district-writer.port';

describe('지역 생성 유스케이스', () => {
    it('중복 city가 없으면 지역을 생성한다', async () => {
        const districtAdminReader: DistrictAdminReaderPort = {
            readAll: jest.fn(),
            findById: jest.fn(),
            findByCity: jest.fn().mockResolvedValue(null),
        };
        const districtWriter: DistrictWriterPort = {
            create: jest.fn().mockResolvedValue({
                id: 'district-1',
                city: '경기도',
                districts: ['수원시'],
                createdAt: new Date('2026-04-06T00:00:00.000Z'),
                updatedAt: new Date('2026-04-06T00:00:00.000Z'),
            }),
            update: jest.fn(),
            delete: jest.fn(),
        };
        const useCase = new CreateDistrictUseCase(
            districtAdminReader,
            districtWriter,
            new DistrictAdminPresentationService(),
        );

        await expect(useCase.execute({ city: '경기도', districts: ['수원시'] })).resolves.toMatchObject({
            city: '경기도',
            districts: ['수원시'],
        });
    });

    it('중복 city가 있으면 예외을 던진다', async () => {
        const useCase = new CreateDistrictUseCase(
            {
                readAll: jest.fn(),
                findById: jest.fn(),
                findByCity: jest.fn().mockResolvedValue({
                    id: 'district-1',
                    city: '경기도',
                    districts: ['수원시'],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }),
            },
            {
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
            new DistrictAdminPresentationService(),
        );

        await expect(useCase.execute({ city: '경기도', districts: ['수원시'] })).rejects.toBeInstanceOf(
            ConflictException,
        );
    });
});
