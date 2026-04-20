import { Injectable } from '@nestjs/common';

import { AlimtalkAdminService } from '../../alimtalk-admin.service';
import { TemplateUpdateRequestDto } from '../../dto/request/template-update-request.dto';
import { TemplateDetailResponseDto } from '../../dto/response/template-detail-response.dto';

@Injectable()
export class UpdateAlimtalkTemplateUseCase {
    constructor(private readonly alimtalkAdminService: AlimtalkAdminService) {}

    execute(templateCode: string, updateData: TemplateUpdateRequestDto): Promise<TemplateDetailResponseDto> {
        return this.alimtalkAdminService.updateTemplate(templateCode, updateData);
    }
}
