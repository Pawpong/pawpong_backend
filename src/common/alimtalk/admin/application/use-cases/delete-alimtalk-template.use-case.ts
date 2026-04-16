import { Injectable } from '@nestjs/common';

import { AlimtalkAdminService } from '../../alimtalk-admin.service';
import { TemplateActionResponseDto } from '../../dto/response/template-action-response.dto';

@Injectable()
export class DeleteAlimtalkTemplateUseCase {
    constructor(private readonly alimtalkAdminService: AlimtalkAdminService) {}

    execute(templateCode: string): Promise<TemplateActionResponseDto> {
        return this.alimtalkAdminService.deleteTemplate(templateCode);
    }
}
