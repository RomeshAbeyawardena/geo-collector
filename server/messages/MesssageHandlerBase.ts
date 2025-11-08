import { IMessageHandler } from "./IMessageHandler";

export default abstract class implements IMessageHandler {
    readonly name:string;
    readonly shortCircuit:boolean;
    
    constructor(name:string, shortCircuit:boolean = false) {
        this.name = name;
        this.shortCircuit = shortCircuit;
    }

    protected wrapPromise<T>(value:T) : Promise<T> {
        return new Promise(r => r(value));
    }

    abstract canHandle(request: any): Promise<boolean>;
    abstract handle(request: any): Promise<void>;
}