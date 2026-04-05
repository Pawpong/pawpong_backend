import { UploadResponseDto } from '../../dto/response/upload-response.dto';
import { StoredUploadResource } from '../ports/upload-file-store.port';

export class UploadResponseMapper {
    static toDto(resource: StoredUploadResource, file: Express.Multer.File): UploadResponseDto {
        return new UploadResponseDto(resource.cdnUrl, resource.fileName, file.size);
    }

    static toDtos(resources: StoredUploadResource[], files: Express.Multer.File[]): UploadResponseDto[] {
        return resources.map((resource, index) => this.toDto(resource, files[index]));
    }
}
