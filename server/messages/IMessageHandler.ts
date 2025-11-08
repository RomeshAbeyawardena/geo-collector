import RegisterMessageHandlers from "./message-registration";

export interface IMessageHandler {
    name: string;
    shortCircuit:boolean;
    canHandle(request:any):Promise<boolean>;
    handle(request:any):Promise<void>;
}

export abstract class MesssageHandlerBase implements IMessageHandler {
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

export interface IMessageDelegateHandler {
    terminateAfterShortCircuit?:boolean | undefined;
}

export class DefaultMessageDelegateHandler extends MesssageHandlerBase implements IMessageDelegateHandler {
    
    private messageHandlers: Array<IMessageHandler> = [];
    private capableMessageHandlers: Array<IMessageHandler> = [];
    public terminateAfterShortCircuit?: boolean | undefined;
    constructor() {
        super("DefaultMessageDelegateHandler");
        RegisterMessageHandlers(this.messageHandlers);
    }

    async canHandle(request: any): Promise<boolean> {
        this.capableMessageHandlers = [];

        let messageHandlers = this.messageHandlers.filter(x => x.shortCircuit);

        if (messageHandlers.length < 1) {
            messageHandlers = this.messageHandlers;
        }

        for(let messageHandler of messageHandlers) {
            if (await messageHandler.canHandle(request)) {
                this.capableMessageHandlers.push(messageHandler);

                if(this.terminateAfterShortCircuit && messageHandler.shortCircuit) {
                    break;
                }
            }
        }
        return this.wrapPromise(this.capableMessageHandlers.length > 0);
    }

    async handle(request: any): Promise<void> {
        for(let messageHandler of this.capableMessageHandlers) {
            try {
                await messageHandler.handle(request);
            }
            catch(err) {
                console.error(`Handler ${this.name} failed:`, err);
            }
        }
    }
}