import { ICoordinate, ICoordinateSchema } from "../models/ICoordinate";
import { IRouter } from "../route";
import base from "./route-base";

export default class extends base {
    name: string = "Geo";

    private lastError?: string;
    constructor(env: Env, ctx: ExecutionContext) {
        super(env, ctx);
        this.accepts.push('POST')
        this.url = 'api/geo';
    }

    async handleJson(request: Request): Promise<ICoordinate | null> {
        const input = await request.text();
        const result = await ICoordinateSchema.safeParseAsync(JSON.parse(input));

        if (result.error) {
            this.lastError = result.error.message;
            return null;
        }

        return result.data as ICoordinate;
    }

    async handleForm(request: Request, coordinates: ICoordinate): Promise<boolean> {
        const formData = await request.formData();

        formData.forEach((v, k) => {

            if (k == "lat" || k == "latitude") {
                coordinates.latitude = Number(v);
            }

            if (k == "lng" || k == "longitude") {
                coordinates.longitude = Number(v);
            }

            if (k == "alt" || k == "altitude") {
                coordinates.altitude = Number(v);
            }
        });

        return !Number.isFinite(coordinates.latitude)
            || !Number.isFinite(coordinates.longitude)
            || (coordinates.altitude != undefined && !Number.isFinite(coordinates.altitude));
    }

    async handle(request: Request): Promise<Response> {

        const headerType = this.headers["content-type"];
        let coordinates: ICoordinate = { latitude: 0, longitude: 0 };

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

    async addGeoLocation(coordinates: ICoordinate): Promise<void> {
        console.log(coordinates);
        await this.env.geo_data.send(JSON.stringify(coordinates));
    }
}
