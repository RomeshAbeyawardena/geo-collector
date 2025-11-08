import { IRouter } from "./route";
import routeBase from "./routes/route-base";
import geo from "./routes/geo";
import catchAll from "./routes/catch-all";

export default function RegisterRoutes(router: IRouter, env: Env, ctx: ExecutionContext) {
    //add routes to register here
    const routes = [
        routeBase.instance(geo, env, ctx),
        routeBase.instance(catchAll, env, ctx)
    ];

    routes.forEach(x => x.registerRoute(router));
}