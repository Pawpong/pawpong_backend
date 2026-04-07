import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

import { ApiController, ApiEndpoint } from '../../../../common/decorator/swagger.decorator';
import { DeleteFilesResponseDto } from '../dto/response/delete-files-response.dto';
import { FileReferenceResponseDto } from '../dto/response/file-reference-response.dto';
import { StorageListResponseDto } from '../dto/response/storage-list-response.dto';

const UPLOAD_ADMIN_FORBIDDEN_RESPONSE = {
    status: 403,
    description: '권한 없음',
    errorExample: '관리자 권한이 필요합니다.',
};

const UPLOAD_ADMIN_BAD_REQUEST_RESPONSE = {
    status: 400,
    description: '잘못된 요청',
    errorExample: '요청값이 올바르지 않습니다.',
};

export function ApiUploadAdminController() {
    return ApiController('스토리지 관리 (Admin)');
}

export function ApiListFilesAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '스토리지 파일 목록 조회',
            description: `
                스토리지 버킷의 파일 목록을 조회합니다.

                ## 주요 기능
                - prefix 쿼리로 특정 경로 하위만 필터링할 수 있습니다.
                - 최대 1000개까지 조회하며, 응답에 isTruncated 여부를 포함합니다.
                - 폴더별 파일 수와 총 용량 통계를 함께 반환합니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: StorageListResponseDto,
            successDescription: '파일 목록 조회 성공',
            successMessageExample: '파일 목록 조회 완료',
            errorResponses: [UPLOAD_ADMIN_BAD_REQUEST_RESPONSE, UPLOAD_ADMIN_FORBIDDEN_RESPONSE],
        }),
        ApiQuery({
            name: 'prefix',
            required: false,
            description: '조회할 폴더 경로. 예: profiles/',
            example: 'profiles/',
        }),
    );
}

export function ApiListFilesByFolderAdminEndpoint() {
    return ApiEndpoint({
        summary: '특정 폴더의 파일 목록 조회',
        description: `
            특정 폴더 경로 하위의 파일 목록만 조회합니다.

            ## 주요 기능
            - folder 파라미터를 prefix 형태로 정규화해서 조회합니다.
            - 응답 구조는 전체 파일 목록 조회와 동일합니다.

            ## 권한
            - 관리자(admin) 권한이 필요합니다.
        `,
        responseType: StorageListResponseDto,
        successDescription: '폴더 파일 목록 조회 성공',
        successMessageExample: '폴더 파일 목록 조회 완료',
        errorResponses: [UPLOAD_ADMIN_BAD_REQUEST_RESPONSE, UPLOAD_ADMIN_FORBIDDEN_RESPONSE],
    });
}

export function ApiDeleteFileAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '단일 파일 삭제',
            description: `
                스토리지에서 단일 파일을 삭제합니다.

                ## 주요 기능
                - fileName 쿼리 파라미터로 삭제 대상 파일 경로를 전달합니다.
                - 성공 시 data는 null 없이 비어 있는 성공 응답 형태로 반환됩니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            successDescription: '파일 삭제 성공',
            successMessageExample: '파일이 삭제되었습니다.',
            nullableData: true,
            errorResponses: [UPLOAD_ADMIN_BAD_REQUEST_RESPONSE, UPLOAD_ADMIN_FORBIDDEN_RESPONSE],
        }),
        ApiQuery({
            name: 'fileName',
            required: true,
            description: '삭제할 파일 경로',
            example: 'profiles/abc123.jpg',
        }),
    );
}

export function ApiDeleteMultipleFilesAdminEndpoint() {
    return ApiEndpoint({
        summary: '다중 파일 삭제',
        description: `
            여러 파일을 한 번에 삭제합니다.

            ## 주요 기능
            - 요청 body의 fileNames 배열을 순회하며 삭제를 수행합니다.
            - 일부 실패가 발생해도 성공/실패 결과를 함께 반환합니다.

            ## 권한
            - 관리자(admin) 권한이 필요합니다.
        `,
        responseType: DeleteFilesResponseDto,
        successDescription: '다중 파일 삭제 성공',
        successMessageExample: '파일 삭제가 완료되었습니다.',
        errorResponses: [UPLOAD_ADMIN_BAD_REQUEST_RESPONSE, UPLOAD_ADMIN_FORBIDDEN_RESPONSE],
    });
}

export function ApiDeleteFolderAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '폴더 전체 삭제',
            description: `
                특정 폴더 하위의 모든 파일을 삭제합니다.

                ## 주요 기능
                - folder 쿼리를 prefix 형식으로 정규화합니다.
                - 폴더 내 파일이 없으면 예외를 반환합니다.
                - 삭제 결과는 deletedCount와 failedFiles로 제공합니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: DeleteFilesResponseDto,
            successDescription: '폴더 삭제 성공',
            successMessageExample: '폴더가 삭제되었습니다.',
            errorResponses: [UPLOAD_ADMIN_BAD_REQUEST_RESPONSE, UPLOAD_ADMIN_FORBIDDEN_RESPONSE],
        }),
        ApiQuery({
            name: 'folder',
            required: true,
            description: '삭제할 폴더 경로',
            example: 'profiles',
        }),
    );
}

export function ApiCheckFileReferencesAdminEndpoint() {
    return ApiEndpoint({
        summary: '파일 DB 참조 확인',
        description: `
            전달한 파일 키들이 데이터베이스에서 실제로 참조 중인지 확인합니다.

            ## 주요 기능
            - 각 파일별로 참조 여부와 참조 위치를 함께 반환합니다.
            - 고아 파일(orphaned file) 후보를 찾는 관리자 점검용 API입니다.

            ## 권한
            - 관리자(admin) 권한이 필요합니다.
        `,
        responseType: FileReferenceResponseDto,
        successDescription: '파일 참조 확인 성공',
        successMessageExample: 'DB 참조 확인 완료',
        errorResponses: [UPLOAD_ADMIN_BAD_REQUEST_RESPONSE, UPLOAD_ADMIN_FORBIDDEN_RESPONSE],
    });
}

export function ApiGetAllReferencedFilesAdminEndpoint() {
    return ApiEndpoint({
        summary: 'DB에서 참조 중인 모든 파일 조회',
        description: `
            데이터베이스에서 현재 사용 중인 모든 파일 키를 조회합니다.

            ## 주요 기능
            - 실제로 참조 중인 파일 경로만 배열 형태로 반환합니다.
            - 스토리지 정리나 orphan file 탐색 전 기준 데이터로 사용할 수 있습니다.

            ## 권한
            - 관리자(admin) 권한이 필요합니다.
        `,
        successDescription: '참조 파일 목록 조회 성공',
        successMessageExample: 'DB 참조 파일 목록 조회 완료',
        dataSchema: {
            type: 'array',
            items: { type: 'string', example: 'profiles/abc123.jpg' },
        },
        errorResponses: [UPLOAD_ADMIN_BAD_REQUEST_RESPONSE, UPLOAD_ADMIN_FORBIDDEN_RESPONSE],
    });
}
