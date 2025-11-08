import { z } from "zod";

export interface IUserSecurity {
    email:string;
    name:string;
    sub:string;
    scopes?:string;
}

export const UserSecuritySchema = z.object({
    email:z.email(),
    name:z.string(),
    sub:z.guid(),
    scopes:z.string()
});