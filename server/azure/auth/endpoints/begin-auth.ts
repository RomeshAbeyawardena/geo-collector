import { IServerResponse } from "../models/IServerResponse";
import base, { IEndpoint } from "./base";
import { v4 as uuidV4 } from "uuid";
import jwt from "@tsndr/cloudflare-worker-jwt";

export interface IBeginAuthResponse extends IServerResponse<IBeginAuthResult> {

}

export interface IBeginAuthResult {
    token:string;
}

export interface IBeginAuthEndpoint extends IEndpoint
{
    prepareToken(env:Env, machineId:string, secret:string):Promise<string>;
    post(token:string, acceptEncoding?:string, automationId?:string):Promise<IBeginAuthResponse>;
}

export default class extends base implements IBeginAuthEndpoint {
    constructor(baseUrl:string) {
        super(baseUrl);
    }

    async prepareToken(env:Env, machineId:string, secret:string): Promise<string> {
        return await jwt.sign({
            aud: env.azure_auth_endpoint,
            iss: env.issuer,
            machineId:machineId,
            secret:secret,
            exp: Math.floor(Date.now() / 1000) + (1 * (60))
        }, env.application_secret, {
            header: {
                alg: "HS256",
                kid: env.signing_key_id,
                typ: "JWT"
            }
        });
    }
    async post(token:string, acceptEncoding?:string, automationId?:string): Promise<IBeginAuthResponse> {
        const result = await fetch(`${this.baseUrl}/api/hasher`, {
            method: "POST",
            headers: {
                "Automation-Id": automationId ?? uuidV4(),
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