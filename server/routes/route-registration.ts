import { IRouter } from "./route";
import routeBase from "./route-base";
import geo from "./geo";
import catchAll from "./catch-all";
import auth from "./auth-introspect";
import authBegin from "./auth-begin";

export default function RegisterRoutes(router: IRouter, env: Env, ctx: ExecutionContext) {
    //add routes to register here
    const routes = [
        routeBase.instance(geo, env, ctx),
        routeBase.instance(auth, env, ctx),
        routeBase.instance(authBegin, env, ctx),
        routeBase.instance(catchAll, env, ctx)
    ];

    routes.forEach(x => x.registerRoute(router));
}