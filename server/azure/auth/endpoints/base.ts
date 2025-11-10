export interface IEndpoint {
    baseUrl:string;
}

export default abstract class implements IEndpoint {
    baseUrl:string;
    constructor(baseUrl:string) {
        this.baseUrl = baseUrl;
    }
}