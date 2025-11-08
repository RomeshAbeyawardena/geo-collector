import MesssageHandlerBase from "./message-handler-base";
import { ICoordinateRequest, CoordinateRequestSchema } from "../models/ICoordinate";
export default class extends MesssageHandlerBase {
    private coordinateRequest?: ICoordinateRequest;

    constructor() {
        super("geo_message_handler");
    }

    async canHandle(request: any): Promise<boolean> {
        const result = await CoordinateRequestSchema.safeParseAsync(request);

        if(result.success)
        {
            this.coordinateRequest = result.data;
        }

        return result.success;
    }

    async handle(request: any): Promise<void> {
        console.log("Received:", this.coordinateRequest);
        //TODO: This is ready to be pushed to a datasource or used.
    }
}