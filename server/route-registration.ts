import { IRouter } from "./route";
import routeBase from "./routes/route-base";
import geo from "./routes/geo";

export default function RegisterRoutes(router: IRouter, env: Env, ctx: ExecutionContext) {
    //add routes to register here
    const routes = [routeBase.instance(geo, env, ctx)];

    routes.forEach(x => x.registerRoute(router));
}