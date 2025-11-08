import RegisterMessageHandlers from "./message-registration";
import MesssageHandlerBase from "./message-handler-base";
import { IMessageHandler } from "./IMessageHandler";

export interface IMessageDelegateHandler {
    terminateAfterShortCircuit?:boolean | undefined;
    registerHandler(handler:IMessageHandler) : IMessageDelegateHandler;
}

export default class extends MesssageHandlerBase implements IMessageDelegateHandler {
    
    private messageHandlers: Array<IMessageHandler> = [];
    private capableMessageHandlers: Array<IMessageHandler> = [];
    public terminateAfterShortCircuit?: boolean | undefined;
    constructor() {
        super("default_message_delegate_handler");
        RegisterMessageHandlers(this);
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

    registerHandler(handler: IMessageHandler): IMessageDelegateHandler {
        this.messageHandlers.push(handler);
        return this;
    }
}