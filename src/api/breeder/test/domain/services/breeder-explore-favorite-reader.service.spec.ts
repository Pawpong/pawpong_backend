import { BreederExploreFavoriteReaderService } from '../../../domain/services/breeder-explore-favorite-reader.service';

describe('BreederExploreFavoriteReaderService', () => {
    const service = new BreederExploreFavoriteReaderService();

    function makePort(adopterResult: string[] | null, breederResult: string[] | null): any {
        return {
            findAdopterFavoriteBreederIds: jest.fn().mockResolvedValue(adopterResult),
            findBreederFavoriteBreederIds: jest.fn().mockResolvedValue(breederResult),
        };
    }

    it('userId가 없으면 빈 배열', async () => {
        expect(await service.readFavoriteBreederIds(undefined, makePort([], []))).toEqual([]);
    });

    it('adopter 결과가 있으면 우선 반환', async () => {
        const port = makePort(['b-1', 'b-2'], []);
        expect(await service.readFavoriteBreederIds('u-1', port)).toEqual(['b-1', 'b-2']);
        expect(port.findBreederFavoriteBreederIds).not.toHaveBeenCalled();
    });

    it('adopter 결과가 null이면 breeder 결과를 반환', async () => {
        const port = makePort(null, ['b-3']);
        expect(await service.readFavoriteBreederIds('u-1', port)).toEqual(['b-3']);
    });

    it('양쪽 다 null이면 빈 배열', async () => {
        expect(await service.readFavoriteBreederIds('u-1', makePort(null, null))).toEqual([]);
    });
});
