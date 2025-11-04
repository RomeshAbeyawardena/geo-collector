import { IRouter } from "../route";
import base from "./base";

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

    async handle(request: Request): Promise<Response> {

        const formData = await request.formData();
        const coordinates: ICoordinate = { latitude: 0, longitude: 0 };
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

        if (!Number.isFinite(coordinates.latitude) || !Number.isFinite(coordinates.longitude)) {
            return new Response(JSON.stringify({ error: 'Invalid coordinates' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } });
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
