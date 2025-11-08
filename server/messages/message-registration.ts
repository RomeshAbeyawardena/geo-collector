import geoMessageHandler from "./geo-message-handler";
import { IMessageDelegateHandler } from "./default-message-delegate-handler";
export default function RegisterMessageHandlers(messageDelegateHandler:IMessageDelegateHandler) {
    //primary handler registration
    messageDelegateHandler
        .registerHandler(new geoMessageHandler());
}