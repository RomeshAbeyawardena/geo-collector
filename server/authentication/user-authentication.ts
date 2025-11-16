import AzureAuthApi from "../azure/auth";
import { UserRegistrationRequestSchema, IUserRegistrationRequest, IAuthenticatedUser, IUserRequest } from "../models/IAuthenticatedUser";
import { UserRequestSchema } from "../models/IAuthenticatedUser";
import { RequestError } from "../routes/request-error";
import authentication from "./authentication";
export default class extends authentication {
    static async getUserRequest(request: Record<string, string>): Promise<IUserRequest> {
        var result = await UserRequestSchema.safeParseAsync(request);

        if (!result.success) {
            throw new RequestError("Unable to parse user request", 400,
                result.error.message
            );
        }

        return result.data;
    }

    constructor(env: Env) {
        super(env);
    }

    async prepareDB(): Promise<void> {
        const db = this.env.geo_data_db;

        await db.batch([db.prepare(`drop table [users]; 
            create table [users] (
             [id] INTEGER PRIMARY KEY AUTOINCREMENT
            ,[clientId] TEXT not null
            ,[sub] TEXT not null
            ,[email] TEXT not null unique
            ,[name] TEXT not null
            ,[secret] TEXT not null
            ,[salt] TEXT not null
        )`), db.prepare(`drop table [servertoken]; 
            create table [servertoken] (
             [id]  INTEGER PRIMARY KEY AUTOINCREMENT
            ,[token] TEXT not null
            ,[validFrom] INTEGER not null
            ,[expires] INTEGER null
        )`)]);
    }
    async registerUser(userRequest: IUserRegistrationRequest): Promise<boolean> {
        //await this.prepareDB();
        
        const hasher = this.azureAuthApi.hasher;
        const token = await hasher.prepareUserHash(this.env, userRequest);
        const authToken = await this.getAuthToken();

        if (!authToken) {
            throw new Error("Unable to authorise the request");
        }

        const response = await hasher.post(token, authToken);
        console.log(response);
        const data = response.data;
        if (!data) {
            return false;
        }

        await this.env.geo_data_db.prepare(`INSERT INTO [users] ([clientId], [email], [name], [sub], [salt], [secret])
            VALUES (?,?,?,?,?,?)`).bind(userRequest.clientId,
            userRequest.email, userRequest.name, userRequest.sub, data.hash, data.salt).run();

        return true;
    }
    async authenticate(request: IUserRequest): Promise<IAuthenticatedUser | undefined> {
        const user = await this.env.geo_data_db.prepare(`
            SELECT [email], [name], [sub], [salt], [secret] FROM [users]
            WHERE [email] = ?
                AND [clientId] = ?
            LIMIT 1`).bind(request.email, request.clientId).first();

        if (!user) {
            throw new RequestError("User not found or credentials don't match", 401);
        }

        const result = await UserRegistrationRequestSchema.safeParseAsync(user);
        if (!result.success) {
            throw new RequestError("Internal parsing failure", 500, result.error.message);
        }

        const data = result.data;
        const hasher = this.azureAuthApi.hasher;
        const token = await hasher.prepareUserHash(this.env, {
            email: data.email,
            sub: data.sub,
            clientId: data.clientId,
            secret: request.secret,
            name: data.name
        });

        const response = await hasher.post(token);
        console.log(response);
        if (!response.data) {
            throw new RequestError("User state unknown", 500);
        }

        console.log(response);

        if (user.secret === response.data) {
            return result.data;
        }

        return undefined;
    }
}