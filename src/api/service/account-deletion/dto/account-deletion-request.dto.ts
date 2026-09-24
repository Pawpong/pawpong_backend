import { Equals, IsString, IsUUID, Matches, ValidateIf } from 'class-validator';
import { PERMANENT_DELETION_CONFIRMATION } from '../application/use-cases/request-account-deletion.use-case';
export class RequestAccountDeletionDto {
    @IsString() @Equals(PERMANENT_DELETION_CONFIRMATION) confirmation: string;
    @ValidateIf((body: RequestAccountDeletionDto) => body.requestId !== undefined || body.receiptToken !== undefined)
    @IsUUID('4')
    requestId?: string;
    @ValidateIf((body: RequestAccountDeletionDto) => body.requestId !== undefined || body.receiptToken !== undefined)
    @IsString()
    @Matches(/^[A-Za-z0-9_-]{43}$/)
    receiptToken?: string;
}
export class AccountDeletionStatusDto {
    @IsUUID('4') requestId: string;
    @IsString() @Matches(/^[A-Za-z0-9_-]{43}$/) receiptToken: string;
}
