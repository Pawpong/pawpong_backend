import { Injectable } from '@nestjs/common';

import { AlimtalkAdminService } from '../../alimtalk-admin.service';
import { TemplateCreateRequestDto } from '../../dto/request/template-create-request.dto';
import { TemplateDetailResponseDto } from '../../dto/response/template-detail-response.dto';

@Injectable()
export class CreateAlimtalkTemplateUseCase {
    constructor(private readonly alimtalkAdminService: AlimtalkAdminService) {}

    execute(createData: TemplateCreateRequestDto): Promise<TemplateDetailResponseDto> {
        return this.alimtalkAdminService.createTemplate(createData);
    }
}
