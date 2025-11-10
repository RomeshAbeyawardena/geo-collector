import { z } from "zod";
export interface IUserRequest {
    email:string;
    clientId:string;
    secret:string;
}

export const UserRequestSchema = z.object({
    email:z.email(),
    clientId:z.guid(),
    secret:z.string()
});

export interface IAuthenticatedUser {
    email:string;
    name:string;
    sub:string;
}

export interface IUserRegistrationRequest extends IUserRequest, IAuthenticatedUser {

}

export const UserRegistrationRequestSchema = z.object({
    email:z.email(),
    clientId:z.guid(),
    name:z.string(),
    secret:z.string(),
    sub:z.string()
});

export const AuthenticatedUserSchema = z.object({
    email:z.email(),
    name:z.string(),
    sub:z.guid()
});