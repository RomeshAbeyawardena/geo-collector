export interface IServerResponse<T> {
    automationId?:string;
    responseId?:string;
    message?:string;
    details?:string;
    data:T;
}