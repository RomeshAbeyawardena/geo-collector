import base, { IEndpoint } from "./base";
import { IUserRegistrationRequest } from "../../../models/IAuthenticatedUser";
import { IHashServerResponse } from "../models/IHashResponse";
import jwt from "@tsndr/cloudflare-worker-jwt";
export interface IHasherEndpoint extends IEndpoint {
    prepareUserHash(env:Env, user: IUserRegistrationRequest) : Promise<string>;
    post(token:string, acceptEncoding?:string) : Promise<IHashServerResponse>
}

export default class extends base implements IHasherEndpoint {
    constructor(baseUrl:string) {
        super(baseUrl);
    }

    async prepareUserHash(env:Env, user: IUserRegistrationRequest): Promise<string> {
        return await jwt.sign({
            aud: env.azure_auth_endpoint,
            iss: env.issuer,
            clientId: user.clientId,
            sub: user.sub,
            email: user.email,
            name: user.name,
            secret: user.secret,
            exp: Math.floor(Date.now() / 1000) + (1 * (60))
        }, env.application_secret, {
            header: {
                typ: "JWT",
                kid: env.signing_key_id,
                alg: "HS256"
            }
        });
    }
    async post(token:string, acceptEncoding?:string): Promise<IHashServerResponse> {
        console.log("API", this.baseUrl);
        const result = await fetch(`${this.baseUrl}/api/hasher`, {
            method: "POST",
            headers: {
                "Accept-Encoding": acceptEncoding ?? "jwt",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token
            })
        });

        return result.json();
    }
}