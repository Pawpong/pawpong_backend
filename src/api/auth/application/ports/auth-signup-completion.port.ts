import { RegisterAdopterRequestDto } from '../../dto/request/register-adopter-request.dto';
import { RegisterBreederRequestDto } from '../../dto/request/register-breeder-request.dto';
import { RegisterAdopterResponseDto } from '../../dto/response/register-adopter-response.dto';
import { RegisterBreederResponseDto } from '../../dto/response/register-breeder-response.dto';

export const REGISTER_ADOPTER_AUTH_SIGNUP = Symbol('REGISTER_ADOPTER_AUTH_SIGNUP');
export const REGISTER_BREEDER_AUTH_SIGNUP = Symbol('REGISTER_BREEDER_AUTH_SIGNUP');

export interface RegisterAdopterAuthSignupPort {
    execute(dto: RegisterAdopterRequestDto): Promise<RegisterAdopterResponseDto>;
}

export interface RegisterBreederAuthSignupPort {
    execute(dto: RegisterBreederRequestDto): Promise<RegisterBreederResponseDto>;
}
