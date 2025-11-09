import { ICoordinateRequest, CoordinateSchema, CoordinateRequestSchema, Coordinate } from "../models/ICoordinate";
import { RequestError } from "./request-error";
import { IRouter } from "./route";
import routeController from "./route-controller";

export default class extends routeController {
    name: string = "Geo";

    private readonly headerId: string = "request-id";
    constructor(env: Env, ctx: ExecutionContext) {
        super(env, ctx);
        this.accepts.push('POST')
        this.url = 'api/geo';
    }

    protected async handleJsonRequest(request: Request): Promise<Response> {
        const result = await CoordinateRequestSchema.safeParseAsync(this.request);
        const error = "Validation errors occured";
        let coordinatesRequest: ICoordinateRequest | undefined;
        let lastError: string = "";
        if (!result.success) {
            lastError = result.error.message;
            const coordinates = await CoordinateSchema.safeParseAsync(this.request);
            
            if (!coordinates.success) {
                throw new RequestError(error, 400, coordinates.error.message);
            }

            const headerRequestId = this.headers[this.headerId];

            coordinatesRequest = {
                requestId: headerRequestId,
                data: coordinates.data
            };
        }
        else {
            coordinatesRequest = result.data;
        }

        if (!coordinatesRequest) {
            throw new RequestError(error, 400, lastError);
        }
        else {
            await this.addGeoLocation(coordinatesRequest);
        }

        const message = "Coordinates committed";
        return this.json({
            data: {
                result: message
            },
            message: message,
        }, 201);

    }

    protected async handleFormRequest(request: Request): Promise<Response> {
        const headerRequestId = this.headers[this.headerId];
        
        const result = Coordinate.safeParse(this.request, true);

        const coordinatesRequest: ICoordinateRequest = {
            data: result,
            requestId: headerRequestId
        }

        await this.addGeoLocation(coordinatesRequest);

        const message = "Coordinates committed";
        return this.json({
            data: {
                result: message
            },
            message: message
        }, 201);
    }

    registerRoute(router: IRouter): void {
        router.registerRoute(this);
    }

    async addGeoLocation(coordinates: ICoordinateRequest): Promise<void> {
        await this.env.geo_data.send(JSON.stringify(coordinates));
    }
}
