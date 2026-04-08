import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiParam } from '@nestjs/swagger';

import { ApiController, ApiEndpoint } from '../../../common/decorator/swagger.decorator';
import { DeleteUploadedFileRequestDto } from '../dto/request/delete-uploaded-file-request.dto';
import { UploadFolderRequestDto } from '../dto/request/upload-folder-request.dto';
import { UploadResponseDto } from '../dto/response/upload-response.dto';
import { UPLOAD_RESPONSE_MESSAGE_EXAMPLES } from '../domain/services/upload-response-message.service';

const UPLOAD_BAD_REQUEST_RESPONSE = {
    status: 400,
    description: '잘못된 요청',
    errorExample: '요청값이 올바르지 않습니다.',
};

function buildMultipartFileBodySchema(
    fileFieldName: 'file' | 'files',
    extraProperties: Record<string, any> = {},
    requiredFields: string[] = [fileFieldName],
) {
    return {
        type: 'object',
        properties: {
            [fileFieldName]:
                fileFieldName === 'file'
                    ? {
                          type: 'string',
                          format: 'binary',
                      }
                    : {
                          type: 'array',
                          items: {
                              type: 'string',
                              format: 'binary',
                          },
                      },
            ...extraProperties,
        },
        required: requiredFields,
    };
}

export function ApiUploadController() {
    return ApiController('업로드');
}

export function ApiUploadRepresentativePhotosEndpoint() {
    return applyDecorators(
        ApiConsumes('multipart/form-data'),
        ApiEndpoint({
            summary: '대표 사진 업로드',
            description: `
                브리더 대표 사진을 업로드하고 프로필 대표 사진 목록을 교체합니다.

                ## 주요 기능
                - 최대 3장까지 업로드할 수 있습니다.
                - 각 파일은 5MB 제한을 따릅니다.
                - 업로드 후 브리더 대표 사진 경로를 즉시 갱신합니다.
            `,
            responseType: [UploadResponseDto],
            successDescription: '대표 사진 업로드 성공',
            successMessageExample: UPLOAD_RESPONSE_MESSAGE_EXAMPLES.representativePhotosUploaded,
            errorResponses: [UPLOAD_BAD_REQUEST_RESPONSE],
        }),
        ApiBody({
            schema: buildMultipartFileBodySchema('files'),
        }),
    );
}

export function ApiUploadAvailablePetPhotosEndpoint() {
    return applyDecorators(
        ApiConsumes('multipart/form-data'),
        ApiEndpoint({
            summary: '분양 개체 사진 업로드',
            description: `
                분양 개체 사진을 업로드하고, 전달한 기존 사진과 함께 전체 목록을 교체합니다.

                ## 주요 기능
                - 최대 5장까지 업로드할 수 있습니다.
                - existingPhotos로 유지할 사진 경로를 함께 전달할 수 있습니다.
                - 최종 사진 목록 기준으로 개체 사진이 갱신됩니다.
            `,
            responseType: [UploadResponseDto],
            successDescription: '분양 개체 사진 업로드 성공',
            successMessageExample: UPLOAD_RESPONSE_MESSAGE_EXAMPLES.availablePetPhotosUploaded,
            errorResponses: [UPLOAD_BAD_REQUEST_RESPONSE],
        }),
        ApiParam({
            name: 'petId',
            description: '분양 개체 ID',
            example: '507f1f77bcf86cd799439011',
        }),
        ApiBody({
            schema: buildMultipartFileBodySchema(
                'files',
                {
                    existingPhotos: {
                        oneOf: [
                            { type: 'string', example: 'pets/available/photo-1.jpg' },
                            {
                                type: 'array',
                                items: { type: 'string' },
                                example: ['pets/available/photo-1.jpg', 'pets/available/photo-2.jpg'],
                            },
                        ],
                    },
                },
            ),
        }),
    );
}

export function ApiUploadParentPetPhotosEndpoint() {
    return applyDecorators(
        ApiConsumes('multipart/form-data'),
        ApiEndpoint({
            summary: '부모견/묘 사진 업로드',
            description: `
                부모견 또는 부모묘 사진을 업로드하고, 전달한 기존 사진과 함께 전체 목록을 교체합니다.

                ## 주요 기능
                - 최대 5장까지 업로드할 수 있습니다.
                - existingPhotos로 유지할 사진 경로를 함께 전달할 수 있습니다.
                - 최종 사진 목록 기준으로 부모 반려동물 사진이 갱신됩니다.
            `,
            responseType: [UploadResponseDto],
            successDescription: '부모견/묘 사진 업로드 성공',
            successMessageExample: UPLOAD_RESPONSE_MESSAGE_EXAMPLES.parentPetPhotosUploaded,
            errorResponses: [UPLOAD_BAD_REQUEST_RESPONSE],
        }),
        ApiParam({
            name: 'petId',
            description: '부모견/묘 ID',
            example: '507f1f77bcf86cd799439011',
        }),
        ApiBody({
            schema: buildMultipartFileBodySchema(
                'files',
                {
                    existingPhotos: {
                        oneOf: [
                            { type: 'string', example: 'pets/parent/photo-1.jpg' },
                            {
                                type: 'array',
                                items: { type: 'string' },
                                example: ['pets/parent/photo-1.jpg', 'pets/parent/photo-2.jpg'],
                            },
                        ],
                    },
                },
            ),
        }),
    );
}

export function ApiUploadSingleFileEndpoint() {
    return applyDecorators(
        ApiConsumes('multipart/form-data'),
        ApiEndpoint({
            summary: '단일 파일 업로드',
            description: `
                단일 파일을 스토리지에 업로드합니다.

                ## 주요 기능
                - folder를 지정하면 해당 경로 하위에 파일을 저장합니다.
                - 공개 업로드 API로 인증 없이 사용할 수 있습니다.
            `,
            responseType: UploadResponseDto,
            isPublic: true,
            successDescription: '단일 파일 업로드 성공',
            successMessageExample: UPLOAD_RESPONSE_MESSAGE_EXAMPLES.singleFileUploaded,
            errorResponses: [UPLOAD_BAD_REQUEST_RESPONSE],
        }),
        ApiBody({
            type: UploadFolderRequestDto,
            schema: buildMultipartFileBodySchema(
                'file',
                {
                    folder: {
                        type: 'string',
                        example: 'profiles',
                    },
                },
            ),
        }),
    );
}

export function ApiUploadMultipleFilesEndpoint() {
    return applyDecorators(
        ApiConsumes('multipart/form-data'),
        ApiEndpoint({
            summary: '다중 파일 업로드',
            description: `
                여러 파일을 한 번에 스토리지에 업로드합니다.

                ## 주요 기능
                - 최대 10개 파일까지 업로드할 수 있습니다.
                - folder를 지정하면 해당 경로 하위에 저장합니다.
                - 공개 업로드 API로 인증 없이 사용할 수 있습니다.
            `,
            responseType: [UploadResponseDto],
            isPublic: true,
            successDescription: '다중 파일 업로드 성공',
            successMessageExample: UPLOAD_RESPONSE_MESSAGE_EXAMPLES.multipleFilesUploaded,
            errorResponses: [UPLOAD_BAD_REQUEST_RESPONSE],
        }),
        ApiBody({
            type: UploadFolderRequestDto,
            schema: buildMultipartFileBodySchema(
                'files',
                {
                    folder: {
                        type: 'string',
                        example: 'profiles',
                    },
                },
            ),
        }),
    );
}

export function ApiDeleteUploadedFileEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '파일 삭제',
            description: `
                저장된 파일을 삭제합니다.

                ## 주요 기능
                - fileName 경로를 기준으로 스토리지 파일을 삭제합니다.
                - 성공 시 data는 null로 반환합니다.
            `,
            isPublic: true,
            nullableData: true,
            successDescription: '파일 삭제 성공',
            successMessageExample: UPLOAD_RESPONSE_MESSAGE_EXAMPLES.fileDeleted,
            errorResponses: [UPLOAD_BAD_REQUEST_RESPONSE],
        }),
        ApiBody({ type: DeleteUploadedFileRequestDto }),
    );
}
