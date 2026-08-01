import { PartialType } from '@nestjs/swagger';

import { AiImageFilterCreateRequestDto } from './ai-image-filter-create-request.dto';

/** 필터 부분 수정 — 생성 DTO 의 모든 필드를 선택적으로 받는다 */
export class AiImageFilterUpdateRequestDto extends PartialType(AiImageFilterCreateRequestDto) {}
