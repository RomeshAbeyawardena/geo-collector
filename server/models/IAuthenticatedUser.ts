import { email, z } from "zod";
import { RequestError } from "../routes/request-error";

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

export const AuthenticatedUserSchema = z.object({
    email:z.email(),
    name:z.string(),
    sub:z.guid()
});

export class UserAuthentication {
    static async getUserRequest(request: Record<string,string>): Promise<IUserRequest>
    {
        var result = await UserRequestSchema.safeParseAsync(request);

        if (!result.success) {
            throw new RequestError("Unable to parse user request", 400,
                result.error.message
            );
        }

        return result.data;
    }
    
    private readonly env:Env;
    constructor(env:Env) {
        this.env = env;
    }

    async authenticate(request: IUserRequest) : Promise<IAuthenticatedUser|undefined>
    {
        //TODO: Hash the secret from request.Secret!
        const secret = 'computedSecret';
        const user = await this.env.geo_data_db.prepare(`
            SELECT [email], [name], [sub] FROM [users]
            WHERE [email] = ?
                AND [clientId] = ?
                AND [secret] = ?
            LIMIT 1`).bind(request.email, request.clientId, secret).first();
        
        if (user) {
            const result = await AuthenticatedUserSchema.safeParseAsync(user);
            if (!result.success){
                throw new RequestError("Internal parsing failure", 500, result.error.message);
            }

            return result.data;
        }

        return undefined;
    }
}