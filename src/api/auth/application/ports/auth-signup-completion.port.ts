import {
    type RegisterAdopterAuthSignupCommand,
    type RegisterAdopterAuthSignupResult,
    type RegisterBreederAuthSignupCommand,
    type RegisterBreederAuthSignupResult,
} from '../types/auth-signup.type';

export const REGISTER_ADOPTER_AUTH_SIGNUP = Symbol('REGISTER_ADOPTER_AUTH_SIGNUP');
export const REGISTER_BREEDER_AUTH_SIGNUP = Symbol('REGISTER_BREEDER_AUTH_SIGNUP');

export interface RegisterAdopterAuthSignupPort {
    execute(command: RegisterAdopterAuthSignupCommand): Promise<RegisterAdopterAuthSignupResult>;
}

export interface RegisterBreederAuthSignupPort {
    execute(command: RegisterBreederAuthSignupCommand): Promise<RegisterBreederAuthSignupResult>;
}
