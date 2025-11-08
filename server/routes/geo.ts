import { ICoordinateRequest, CoordinateSchema, CoordinateRequestSchema } from "../models/ICoordinate";
import { IRouter } from "../route";
import base from "./route-base";

export default class extends base {
    name: string = "Geo";

    private lastError?: string;
    private readonly headerId: string = "request-id";
    constructor(env: Env, ctx: ExecutionContext) {
        super(env, ctx);
        this.accepts.push('POST')
        this.url = 'api/geo';
    }

    async handleJson(request: Request): Promise<ICoordinateRequest | null> {
        const input = await request.text();
        const rawJson = JSON.parse(input);
        const result = await CoordinateRequestSchema.safeParseAsync(rawJson);

        if (!result.success) {
            this.lastError = result.error.message;

            const coordinates = await CoordinateSchema.safeParseAsync(rawJson);

            if (!coordinates.success) {
                this.lastError = result.error.message;
                return null;
            }

            const headerRequestId = this.headers[this.headerId];

            return {
                requestId: headerRequestId,
                data: coordinates.data
            }
        }
        else {
            return result.data as ICoordinateRequest;
        }
    }

    async handleForm(request: Request, coordinates: ICoordinateRequest): Promise<boolean> {
        const formData = await request.formData();
        
        if (!coordinates.data) {
            coordinates.data = {
                latitude: 0,
                longitude: 0
            }
        }

        formData.forEach((v, k) => {
            if (k == "lat" || k == "latitude") {
                coordinates.data.latitude = Number(v);
            }
            else if (k == "lng" || k == "longitude") {
                coordinates.data.longitude = Number(v);
            }
            else if (k == "alt" || k == "altitude") {
                coordinates.data.altitude = Number(v);
            }
        });

        return !Number.isFinite(coordinates.data.latitude)
            || !Number.isFinite(coordinates.data.longitude)
            || (coordinates.data.altitude != undefined && !Number.isFinite(coordinates.data.altitude));
    }

    async handle(request: Request): Promise<Response> {

        const headerType = this.headers["content-type"];
        const headerRequestId = this.headers[this.headerId];

        let coordinates: ICoordinateRequest = { requestId: headerRequestId, 
            data: { latitude: 0, longitude: 0 } };

        if (headerType && headerType == "application/json") {
            let result = await this.handleJson(request);

            if (result) {
                coordinates = result;
            }
            else {
                return this.error({
                    message: 'Invalid coordinates',
                    detail: this.lastError
                });
            }
        }
        else {
            if (!await this.handleForm(request, coordinates)) {
                return this.error({
                    message: 'Invalid coordinates'
                });
            }
        }

        const result = await CoordinateRequestSchema.safeParseAsync(coordinates);

        if (!result.success) {
            
            return this.error({
                message: "Validation failed",
                detail: result.error.message
            }, 400);
        }

        await this.addGeoLocation(coordinates);
        const message = "Coordinates committed";
        return this.json({
            data: {
                result: message
            },
            message: message,
        }, 201);
    }

    registerRoute(router: IRouter): void {
        router.registerRoute(this);
    }

    async addGeoLocation(coordinates: ICoordinateRequest): Promise<void> {
        await this.env.geo_data.send(JSON.stringify(coordinates));
    }
}
