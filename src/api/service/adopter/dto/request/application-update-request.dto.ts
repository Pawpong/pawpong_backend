import { OmitType } from '@nestjs/swagger';

import { ApplicationCreateRequestDto } from './application-create-request.dto';

/**
 * 입양 신청서 전체 수정 요청 DTO.
 *
 * breederId/petId 는 신청이 향하는 대상을 바꾸는 것이라 수정 범위가 아니다 —
 * 그 외 연락처·표준 응답·커스텀 응답은 생성 때와 동일하게 전체를 다시 받는다.
 */
export class ApplicationUpdateRequestDto extends OmitType(ApplicationCreateRequestDto, [
    'breederId',
    'petId',
] as const) {}
