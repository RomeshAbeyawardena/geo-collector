import { IRouter } from "../route";
import base from "./route-base";

export interface ICoordinate {
    latitude: number;
    longitude: number;
    altitude?: number;
}

export default class extends base {
    name: string = "Geo";

    constructor(env: Env, ctx: ExecutionContext) {
        super(env, ctx);
        this.accepts.push('POST')
        this.url = 'api/geo';
    }

    async handleJson(request: Request): Promise<ICoordinate> {
        const input = await request.text();
        return JSON.parse(input);
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

        return !Number.isFinite(coordinates.latitude) || !Number.isFinite(coordinates.longitude);
    }

    async handle(request: Request): Promise<Response> {

        const headerType = this.headers["content-type"];
        let coordinates: ICoordinate = { latitude: 0, longitude: 0 };

        if (headerType && headerType == "application/json") {
            coordinates = await this.handleJson(request);
        }
        else {
            if (await this.handleForm(request, coordinates)) {
                return new Response(JSON.stringify({ error: 'Invalid coordinates' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } });
            }
        }

        await this.addGeoLocation(coordinates);
        return new Response('{"name": "Coordinates commited"}', { status: 201 });
    }

    registerRoute(router: IRouter): void {
        router.registerRoute(this);
    }

    async addGeoLocation(coordinates: ICoordinate): Promise<void> {
        console.log(coordinates);
        await this.env.geo_data.send(JSON.stringify(coordinates));
    }
}
