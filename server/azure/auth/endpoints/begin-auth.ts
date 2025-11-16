import { IServerResponse } from "../models/IServerResponse";
import base, { IEndpoint } from "./base";
import { v4 as uuidV4 } from "uuid";
import jwt from "@tsndr/cloudflare-worker-jwt";
import dayjs from "dayjs";

export interface IBeginAuthResponse extends IServerResponse<IBeginAuthResult> {

}

export interface IBeginAuthResult {
    token:string;
}

export interface IServerToken {
    token:string;
    expires:Date;
}

export interface IBeginAuthEndpoint extends IEndpoint
{
    loadToken(env:Env):Promise<IServerToken|undefined>;
    saveToken(env: Env, token:string) :Promise<void>;
    prepareToken(env:Env, machineId:string, secret:string):Promise<string>;
    post(token:string, acceptEncoding?:string, automationId?:string):Promise<IBeginAuthResponse>;
}

export default class extends base implements IBeginAuthEndpoint {
    constructor(baseUrl:string) {
        super(baseUrl);
    }

    async loadToken(env:Env) {
        const dateNow = dayjs();

        const result = await env.geo_data_db.prepare("SELECT * FROM [servertoken] WHERE ValidFrom <= ? AND Expires >= ? LIMIT 1")
        .bind(dateNow.unix(), dateNow.unix()).first();

        if (result) {
            return {
                token: result.token,
                expires: result.expires
            } as IServerToken;
        }

        return undefined;
    }

    async saveToken(env: Env, token:string) {
        const dateNow = dayjs();
        const expiry = dayjs().add(2, "hours");
        await env.geo_data_db.prepare("INSERT INTO [servertoken] (Token, ValidFrom, Expires) VALUES(?,?,?)")
        .bind(token, dateNow.unix(), expiry.unix()).run();
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
        const result = await fetch(`${this.baseUrl}/api/begin-auth`, {
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