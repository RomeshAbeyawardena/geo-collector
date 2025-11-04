import { IRouter } from "./route";
import geo from "./routes/geo";
import { Env, ExecutionContext } from '../worker-configuration';

export default function RegisterRoutes(router: IRouter, env: Env, ctx: ExecutionContext) {
    //add routes to register here
    const routes = [new geo(env, ctx)];

    routes.forEach(x => x.registerRoute(router));
}