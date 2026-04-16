import { applyDecorators, Type } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiTags, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';

import { ApiResponseDto } from '../dto/response/api-response.dto';

type ApiSchema = Record<string, unknown>;

type ApiErrorResponseOption = {
    status: number;
    description: string;
    errorExample?: string;
};

type ApiEndpointOptions = {
    summary: string;
    description?: string;
    responseType?: Type<unknown> | [Type<unknown>];
    dataSchema?: ApiSchema;
    isPublic?: boolean;
    supportsOptionalAuth?: boolean;
    successStatus?: number;
    successDescription?: string;
    successMessageExample?: string;
    errorResponses?: readonly ApiErrorResponseOption[];
    additionalModels?: Type<unknown>[];
    nullableData?: boolean;
};

type ApiPaginatedEndpointOptions = {
    summary: string;
    description?: string;
    responseType: Type<unknown>;
    itemType?: Type<unknown>;
    isPublic?: boolean;
    supportsOptionalAuth?: boolean;
    successStatus?: number;
    successDescription?: string;
    successMessageExample?: string;
    errorResponses?: readonly ApiErrorResponseOption[];
    additionalModels?: Type<unknown>[];
};

type ApiRawEndpointOptions = {
    summary: string;
    description?: string;
    responseType?: Type<unknown> | [Type<unknown>];
    responseSchema?: ApiSchema;
    isPublic?: boolean;
    supportsOptionalAuth?: boolean;
    successStatus?: number;
    successDescription?: string;
    errorResponses?: readonly ApiErrorResponseOption[];
    additionalModels?: Type<unknown>[];
};

function buildErrorResponses(
    isPublic?: boolean,
    supportsOptionalAuth?: boolean,
    customErrorResponses: readonly ApiErrorResponseOption[] = [],
): ApiErrorResponseOption[] {
    const errorResponses = new Map<number, ApiErrorResponseOption>();

    errorResponses.set(400, {
        status: 400,
        description: '잘못된 요청',
        errorExample: '잘못된 요청입니다.',
    });

    if (!isPublic && !supportsOptionalAuth) {
        errorResponses.set(401, {
            status: 401,
            description: '인증 실패',
            errorExample: '인증이 필요합니다.',
        });
    }

    for (const errorResponse of customErrorResponses) {
        errorResponses.set(errorResponse.status, errorResponse);
    }

    return Array.from(errorResponses.values());
}

function buildErrorResponseDecorator(errorResponse: ApiErrorResponseOption) {
    return ApiResponse({
        status: errorResponse.status,
        description: errorResponse.description,
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: false },
                code: { type: 'number', example: errorResponse.status },
                error: { type: 'string', example: errorResponse.errorExample || errorResponse.description },
                timestamp: { type: 'string', example: '2025-01-26T10:30:00.000Z' },
            },
            required: ['success', 'code', 'error', 'timestamp'],
        },
    });
}

function buildRawErrorResponseDecorator(errorResponse: ApiErrorResponseOption) {
    return ApiResponse({
        status: errorResponse.status,
        description: errorResponse.description,
    });
}

function buildOperationOptions(summary: string, description?: string, supportsOptionalAuth?: boolean) {
    const optionalSecurity = [{ 'JWT-Auth': [] as string[] }, {} as Record<string, string[]>];

    return {
        summary,
        description: description || summary,
        ...(supportsOptionalAuth
            ? {
                  security: optionalSecurity,
              }
            : {}),
    };
}

/**
 * API 엔드포인트 스웨거 데코레이터
 * 공통 스웨거 설정을 한번에 적용하고, ApiResponseDto<T> 형식의 응답을 올바르게 표시합니다.
 */
export function ApiEndpoint(options: ApiEndpointOptions) {
    const successStatus = options.successStatus ?? 200;
    const successDescription = options.successDescription ?? '성공';
    const successMessageExample = options.successMessageExample ?? '요청이 성공적으로 처리되었습니다.';
    const decorators = [
        ApiOperation(buildOperationOptions(options.summary, options.description, options.supportsOptionalAuth)),
    ];

    // responseType이 있을 경우 ApiResponseDto<T> 형식으로 Swagger 스키마 생성
    if (options.responseType) {
        const isArray = Array.isArray(options.responseType);
        const DtoType = isArray ? options.responseType[0] : options.responseType;

        decorators.push(ApiExtraModels(ApiResponseDto, DtoType, ...(options.additionalModels || [])));
        decorators.push(
            ApiResponse({
                status: successStatus,
                description: successDescription,
                schema: {
                    allOf: [
                        { $ref: getSchemaPath(ApiResponseDto) },
                        {
                            properties: {
                                success: { type: 'boolean', example: true },
                                code: { type: 'number', example: successStatus },
                                data: isArray
                                    ? {
                                          type: 'array',
                                          items: { $ref: getSchemaPath(DtoType) },
                                      }
                                    : {
                                          $ref: getSchemaPath(DtoType),
                                      },
                                message: { type: 'string', example: successMessageExample },
                                timestamp: { type: 'string', example: '2025-01-26T10:30:00.000Z' },
                            },
                            required: ['success', 'code', 'data', 'timestamp'],
                        },
                    ],
                },
            }),
        );
    } else {
        const dataSchema = options.dataSchema
            ? options.dataSchema
            : options.nullableData
              ? { type: 'object', nullable: true, example: null }
              : { type: 'object', example: {} };

        if (options.additionalModels?.length) {
            decorators.push(ApiExtraModels(...options.additionalModels));
        }

        decorators.push(
            ApiResponse({
                status: successStatus,
                description: successDescription,
                schema: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        code: { type: 'number', example: successStatus },
                        data: dataSchema,
                        message: { type: 'string', example: successMessageExample },
                        timestamp: { type: 'string', example: '2025-01-26T10:30:00.000Z' },
                    },
                    required: ['success', 'code', 'data', 'timestamp'],
                },
            }),
        );
    }

    if (!options.isPublic && !options.supportsOptionalAuth) {
        decorators.push(ApiBearerAuth('JWT-Auth'));
    }

    buildErrorResponses(options.isPublic, options.supportsOptionalAuth, options.errorResponses).forEach(
        (errorResponse) => {
            decorators.push(buildErrorResponseDecorator(errorResponse));
        },
    );

    return applyDecorators(...decorators);
}

/**
 * 페이지네이션 API 스웨거 데코레이터
 * ApiResponseDto<PaginationResponseDto<T>> 형식의 응답을 올바르게 표시합니다.
 */
export function ApiPaginatedEndpoint(options: ApiPaginatedEndpointOptions) {
    const successStatus = options.successStatus ?? 200;
    const successDescription = options.successDescription ?? '성공 (페이지네이션)';
    const successMessageExample = options.successMessageExample ?? '데이터 조회가 완료되었습니다.';
    const decorators = [
        ApiOperation(buildOperationOptions(options.summary, options.description, options.supportsOptionalAuth)),
    ];

    // responseType이 있을 경우 ApiResponseDto<PaginationResponseDto<T>> 형식으로 Swagger 스키마 생성
    if (options.responseType) {
        decorators.push(
            ApiExtraModels(
                ApiResponseDto,
                options.responseType,
                ...(options.itemType ? [options.itemType] : []),
                ...(options.additionalModels || []),
            ),
        );
        decorators.push(
            ApiResponse({
                status: successStatus,
                description: successDescription,
                schema: {
                    allOf: [
                        { $ref: getSchemaPath(ApiResponseDto) },
                        {
                            properties: {
                                success: { type: 'boolean', example: true },
                                code: { type: 'number', example: successStatus },
                                data: {
                                    type: 'object',
                                    properties: {
                                        items: {
                                            type: 'array',
                                            items: options.itemType
                                                ? { $ref: getSchemaPath(options.itemType) }
                                                : { type: 'object' },
                                        },
                                        pagination: {
                                            type: 'object',
                                            properties: {
                                                currentPage: { type: 'number', example: 1 },
                                                pageSize: { type: 'number', example: 10 },
                                                totalItems: { type: 'number', example: 100 },
                                                totalPages: { type: 'number', example: 10 },
                                                hasNextPage: { type: 'boolean', example: true },
                                                hasPrevPage: { type: 'boolean', example: false },
                                            },
                                        },
                                    },
                                },
                                message: { type: 'string', example: successMessageExample },
                                timestamp: { type: 'string', example: '2025-01-26T10:30:00.000Z' },
                            },
                            required: ['success', 'code', 'data', 'timestamp'],
                        },
                    ],
                },
            }),
        );
    }

    if (!options.isPublic && !options.supportsOptionalAuth) {
        decorators.push(ApiBearerAuth('JWT-Auth'));
    }

    buildErrorResponses(options.isPublic, options.supportsOptionalAuth, options.errorResponses).forEach(
        (errorResponse) => {
            decorators.push(buildErrorResponseDecorator(errorResponse));
        },
    );

    return applyDecorators(...decorators);
}

/**
 * 컨트롤러 스웨거 데코레이터
 */
export function ApiController(tagName: string) {
    return applyDecorators(ApiTags(tagName), ApiBearerAuth('JWT-Auth'));
}

export function ApiPublicController(tagName: string) {
    return applyDecorators(ApiTags(tagName));
}

export function ApiRawEndpoint(options: ApiRawEndpointOptions) {
    const successStatus = options.successStatus ?? 200;
    const successDescription = options.successDescription ?? '성공';
    const decorators = [
        ApiOperation(buildOperationOptions(options.summary, options.description, options.supportsOptionalAuth)),
    ];

    if (options.responseType) {
        const isArray = Array.isArray(options.responseType);
        const DtoType = isArray ? options.responseType[0] : options.responseType;

        decorators.push(ApiExtraModels(DtoType, ...(options.additionalModels || [])));
        decorators.push(
            ApiResponse({
                status: successStatus,
                description: successDescription,
                schema: isArray
                    ? {
                          type: 'array',
                          items: { $ref: getSchemaPath(DtoType) },
                      }
                    : {
                          $ref: getSchemaPath(DtoType),
                      },
            }),
        );
    } else if (options.responseSchema) {
        if (options.additionalModels?.length) {
            decorators.push(ApiExtraModels(...options.additionalModels));
        }

        decorators.push(
            ApiResponse({
                status: successStatus,
                description: successDescription,
                schema: options.responseSchema,
            }),
        );
    }

    if (!options.isPublic && !options.supportsOptionalAuth) {
        decorators.push(ApiBearerAuth('JWT-Auth'));
    }

    buildErrorResponses(options.isPublic, options.supportsOptionalAuth, options.errorResponses).forEach(
        (errorResponse) => {
            decorators.push(buildRawErrorResponseDecorator(errorResponse));
        },
    );

    return applyDecorators(...decorators);
}
