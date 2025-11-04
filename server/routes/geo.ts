import { IRouter } from "../route";

import base from "./base";
import { ExecutionContext } from "@cloudflare/workers-types"

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
    }

    async canAcceptRequest(request: Request): Promise<boolean> {
        let canAcceptRequest = await super.canAcceptRequest(request)
            && request.url.endsWith('api/geo');
        console.log(request.url);
        return canAcceptRequest;
    }
    async handle(request: Request): Promise<Response> {

        const formData = await request.formData();
        const coordinates: ICoordinate = { latitude: 0, longitude: 0 };
        formData.forEach((v, k) => {
            console.log(k, v);
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

        addGeoLocation(coordinates);
        return new Response('{"name": "Coordinates commited"}', { status: 201 });
    }

    registerRoute(router: IRouter): void {
        router.registerRoute(this);
    }

}

function addGeoLocation(coordinates: ICoordinate): Promise<void> {
    console.log(coordinates);
    return new Promise((r) => r());
}