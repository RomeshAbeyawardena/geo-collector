import argon2id from "argon2id";
import { AuthenticatedUserSchema, IAuthenticatedUser, IUserRequest } from "../models/IAuthenticatedUser";
import { UserRequestSchema } from "../models/IAuthenticatedUser";
import { RequestError } from "../routes/request-error";

function getBytes(value:string) : Uint8Array
{
    const encoder = new TextEncoder();
    return encoder.encode(value);
}

function base64ToUint8Array(base64: string): Uint8Array {
  // Decode base64 into a binary string
  const binaryString = atob(base64);

  // Allocate a typed array
  const bytes = new Uint8Array(binaryString.length);

  // Fill it with char codes
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

function equalBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}


export default class {
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
    async prepareDB(): Promise<void> {
        await this.env.geo_data_db.prepare(`drop table [users]; create table [users] (
            [Id] INTEGER PRIMARY KEY AUTOINCREMENT,
            [clientId] TEXT not null,
            [sub] TEXT not null,
            [email] TEXT not null unique,
            [name] TEXT not null,
            [secret] TEXT not null,
            [salt] TEXT not null
        )`).run()
    }
    async authenticate(request: IUserRequest) : Promise<IAuthenticatedUser|undefined>
    {
        const user = await this.env.geo_data_db.prepare(`
            SELECT [email], [name], [sub], [salt], [secret] FROM [users]
            WHERE [email] = ?
                AND [clientId] = ?
            LIMIT 1`).bind(request.email, request.clientId).first();
        
        if (!user) {
            throw new RequestError("User not found or credentials don't match", 401);
        }

        const argon2Id = await argon2id();
        
        const saltedSecret = argon2Id({
            password: getBytes(request.secret),
            salt: base64ToUint8Array(user.salt as string),
            parallelism: 4,
            passes: 3,
            memorySize: 2 ** 16,
            tagLength: 32
        });
        //assumes user.secret will be stored as base64 string
        if (equalBytes(getBytes(user.secret as string), saltedSecret)) {
            const result = await AuthenticatedUserSchema.safeParseAsync(user);
            if (!result.success){
                throw new RequestError("Internal parsing failure", 500, result.error.message);
            }

            return result.data;
        }

        return undefined;
    }
}