import hasher, { IHasherEndpoint } from "./endpoints/hasher";

export interface IAzureAuthApi {
    hasher: IHasherEndpoint;
}

export default class AzureAuthApi implements IAzureAuthApi {
    hasher: IHasherEndpoint;

    constructor(baseUrl:string) {
        this.hasher = new hasher(baseUrl);
    }
}

