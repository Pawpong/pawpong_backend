import { BadRequestException, ConflictException } from '@nestjs/common';

import { UpdateDistrictUseCase } from './update-district.use-case';
import { DistrictAdminPresentationService } from '../../../domain/services/district-admin-presentation.service';
import { DistrictAdminReaderPort } from '../ports/district-admin-reader.port';
import { DistrictWriterPort } from '../ports/district-writer.port';

describe('UpdateDistrictUseCase', () => {
    it('지역이 있으면 수정된 응답을 반환한다', async () => {
        const districtAdminReader: DistrictAdminReaderPort = {
            readAll: jest.fn(),
            findById: jest.fn().mockResolvedValue({
                id: 'district-1',
                city: '경기도',
                districts: ['수원시'],
                createdAt: new Date('2026-04-06T00:00:00.000Z'),
                updatedAt: new Date('2026-04-06T00:00:00.000Z'),
            }),
            findByCity: jest.fn().mockResolvedValue(null),
        };
        const districtWriter: DistrictWriterPort = {
            create: jest.fn(),
            update: jest.fn().mockResolvedValue({
                id: 'district-1',
                city: '경기도',
                districts: ['수원시', '성남시'],
                createdAt: new Date('2026-04-06T00:00:00.000Z'),
                updatedAt: new Date('2026-04-06T00:00:00.000Z'),
            }),
            delete: jest.fn(),
        };
        const useCase = new UpdateDistrictUseCase(
            districtAdminReader,
            districtWriter,
            new DistrictAdminPresentationService(),
        );

        await expect(useCase.execute('district-1', { districts: ['수원시', '성남시'] })).resolves.toMatchObject({
            city: '경기도',
            districts: ['수원시', '성남시'],
        });
    });

    it('지역이 없으면 BadRequestException을 던진다', async () => {
        const useCase = new UpdateDistrictUseCase(
            {
                readAll: jest.fn(),
                findById: jest.fn().mockResolvedValue(null),
                findByCity: jest.fn(),
            },
            {
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
            new DistrictAdminPresentationService(),
        );

        await expect(useCase.execute('missing', { districts: ['구'] })).rejects.toBeInstanceOf(BadRequestException);
    });

    it('변경하려는 city가 중복이면 ConflictException을 던진다', async () => {
        const districtAdminReader: DistrictAdminReaderPort = {
            readAll: jest.fn(),
            findById: jest.fn().mockResolvedValue({
                id: 'district-1',
                city: '경기도',
                districts: ['수원시'],
                createdAt: new Date(),
                updatedAt: new Date(),
            }),
            findByCity: jest.fn().mockResolvedValue({
                id: 'district-2',
                city: '서울특별시',
                districts: ['강남구'],
                createdAt: new Date(),
                updatedAt: new Date(),
            }),
        };
        const useCase = new UpdateDistrictUseCase(
            districtAdminReader,
            {
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
            new DistrictAdminPresentationService(),
        );

        await expect(useCase.execute('district-1', { city: '서울특별시' })).rejects.toBeInstanceOf(
            ConflictException,
        );
    });
});
