import { IRoute, IRouter } from "./route";
import RegisterRoutes from "./route-registration";

export default class implements IRouter {
    routes: Array<IRoute> = [];
    env: Env;
    ctx: ExecutionContext;
    constructor(env: Env, ctx: ExecutionContext) {
        this.env = env;
        this.ctx = ctx;

        RegisterRoutes(this, env, ctx);
    }

    registerRoute(route: IRoute): void {
        this.routes.push(route);
    }
    async handle(request: Request): Promise<Response> {
        let route: IRoute | undefined;

        for (let r of this.routes) {
            var value = await r.canAcceptRequest(request);

            if (value) {
                route = r;
                break;
            }
        }

        if (route != undefined) {
            return await route.handle(request);
        }


        return new Response('{"state": "Not found"}', { status: 404 });
    }
}