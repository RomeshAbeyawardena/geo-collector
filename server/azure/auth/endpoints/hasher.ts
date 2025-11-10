import base, { IEndpoint } from "./base";

export interface IHasherEndpoint extends IEndpoint {
    post(token:string, acceptEncoding?:string) : Promise<string>
}

export interface IHashRequest {

}

export default class extends base implements IHasherEndpoint {
    constructor(baseUrl:string) {
        super(baseUrl);
    }

    async post(token:string, acceptEncoding?:string): Promise<string> {
        const result = await fetch(`${this.baseUrl}/api/hasher`, {
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