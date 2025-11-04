import { IRouter } from "./route";
import geo from "./routes/geo";
export default function RegisterRoutes(router: IRouter, env: Env, ctx: ExecutionContext) {
    //add routes to register here
    new geo(env, ctx)
        .registerRoute(router);
}