export class RequestError extends Error
{
    statusCode:number;
    details?:string;
    constructor(message:string, statusCode:number, details?:string, options?:ErrorOptions) {
        super(message, options);
        this.statusCode = statusCode;
        this.details = details;
    }
}