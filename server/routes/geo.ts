import { ICoordinateRequest, CoordinateSchema, CoordinateRequestSchema } from "../models/ICoordinate";
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

        let coordinatesRequest: ICoordinateRequest | undefined;
        let lastError: string = "";
        if (!result.success) {
            lastError = result.error.message;
            const coordinates = await CoordinateSchema.safeParseAsync(this.request);

            if (!coordinates.success) {
                throw coordinates.error.message;
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
            throw lastError;
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
        console.log(this.request);
        const coordinatesRequest: ICoordinateRequest | undefined = {
            data: {
                altitude: this.request["alt"] || this.request["altitude"]
                    ? Number(this.request["alt"] ?? this.request["altitude"])
                    : undefined,
                latitude: Number(this.request["lat"] ?? this.request["latitude"]),
                longitude: Number(this.request["lng"] ?? this.request["longitude"])
            },
            requestId: headerRequestId
        };

        const coordinates = coordinatesRequest.data;
        if (!Number.isFinite(coordinates.latitude)
            || !Number.isFinite(coordinates.longitude)
            || (coordinates.altitude != undefined && !Number.isFinite(coordinates.altitude))) {
            throw 'Invalid form data: Must provide a lat/latitude and lng/longitude field.';
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
