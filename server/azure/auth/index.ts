import beginAuth, { IBeginAuthEndpoint } from "./endpoints/begin-auth";
import hasher, { IHasherEndpoint } from "./endpoints/hasher";

export interface IAzureAuthApi {
    beginAuth: IBeginAuthEndpoint;
    hasher: IHasherEndpoint;
}

export default class AzureAuthApi implements IAzureAuthApi {
    beginAuth: IBeginAuthEndpoint;
    hasher: IHasherEndpoint;

    constructor(baseUrl:string) {
        this.beginAuth = new beginAuth(baseUrl);
        this.hasher = new hasher(baseUrl);
    }
}

