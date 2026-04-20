import { Injectable } from '@nestjs/common';

import { AlimtalkAdminService } from '../../alimtalk-admin.service';
import { TemplateDetailResponseDto } from '../../dto/response/template-detail-response.dto';

@Injectable()
export class GetAlimtalkTemplateByCodeUseCase {
    constructor(private readonly alimtalkAdminService: AlimtalkAdminService) {}

    execute(templateCode: string): Promise<TemplateDetailResponseDto> {
        return this.alimtalkAdminService.getTemplateByCode(templateCode);
    }
}
