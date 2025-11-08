export interface IMessageHandler {
    name: string;
    shortCircuit:boolean;
    canHandle(request:any):Promise<boolean>;
    handle(request:any):Promise<void>;
}
