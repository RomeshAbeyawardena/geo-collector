import geoMessageHandler from "./geo-message-handler";
import { IMessageHandler } from "./IMessageHandler";

export default function RegisterMessageHandlers(messageHandlers:IMessageHandler[]) {
    //primary handler registration
    messageHandlers.push(new geoMessageHandler());
}