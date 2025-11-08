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

        const input = await request.text();
        const rawJson = JSON.parse(input);
        const result = await CoordinateRequestSchema.safeParseAsync(rawJson);

        let coordinatesRequest: ICoordinateRequest | undefined;
        let lastError: string = "";
        if (!result.success) {
            lastError = result.error.message;
            const coordinates = await CoordinateSchema.safeParseAsync(rawJson);

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
        const formData = await request.formData();
        const headerRequestId = this.headers[this.headerId];
        const coordinatesRequest: ICoordinateRequest | undefined = {
            data: {
                latitude: 0,
                longitude: 0
            },
            requestId: headerRequestId
        };

        let requiredFieldsSupplied:number = 0;
        formData.forEach((v, k) => {
            if (k == "lat" || k == "latitude") {
                coordinatesRequest.data.latitude = Number(v);
                requiredFieldsSupplied++;
            }
            else if (k == "lng" || k == "longitude") {
                coordinatesRequest.data.longitude = Number(v);
                requiredFieldsSupplied++;
            }
            else if (k == "alt" || k == "altitude") {
                coordinatesRequest.data.altitude = Number(v);
            }
        });

        const coordinates = coordinatesRequest.data;
        if (requiredFieldsSupplied < 2 
            || !Number.isFinite(coordinates.latitude)
            || !Number.isFinite(coordinates.longitude)
            || (coordinates.altitude != undefined && !Number.isFinite(coordinates.altitude))) {
            throw 'Invalid form data: Must provide a lat/latitude and lng/longtitude field.';
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
