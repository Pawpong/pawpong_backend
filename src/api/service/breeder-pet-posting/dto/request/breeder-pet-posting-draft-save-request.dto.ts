import { OmitType, PartialType } from '@nestjs/swagger';

import { CreateBreederPetPostingRequestDto } from './breeder-pet-posting-create-request.dto';

/**
 * v2 분양글 임시저장 요청 DTO.
 *
 * 작성 요청과 동일한 필드 구성에서 전 필드를 옵션으로 완화한 형태다.
 * 보낸 필드에는 작성 요청과 같은 타입 검증이 적용되고(예: photos 는 보낼 경우 1~10장),
 * cross-field 규칙(접종 상태-기록 상호 배타 등)은 draft 단계에서는 강제하지 않는다.
 * draftId 는 등록 연계용 필드라 임시저장 payload 에서는 제외한다.
 */
export class SaveBreederPetPostingDraftRequestDto extends PartialType(
    OmitType(CreateBreederPetPostingRequestDto, ['draftId'] as const),
) {}
