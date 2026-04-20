import { Injectable } from '@nestjs/common';

import { AlimtalkAdminService } from '../../alimtalk-admin.service';
import { TemplateListResponseDto } from '../../dto/response/template-list-response.dto';

@Injectable()
export class GetAlimtalkTemplatesUseCase {
    constructor(private readonly alimtalkAdminService: AlimtalkAdminService) {}

    execute(): Promise<TemplateListResponseDto> {
        return this.alimtalkAdminService.getTemplates();
    }
}
