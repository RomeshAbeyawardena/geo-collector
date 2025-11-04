import { IRoute, IRouter } from "./route";
import RegisterRoutes from "./route-registration";
import base from "./routes/base";

export class MyCatchAllRoute extends base {
    name: string = "*";

    constructor(env: Env, ctx: ExecutionContext) {
        super(env, ctx);
    }

    canAcceptRequest(request: Request): Promise<boolean> {

        return new Promise((r) => r(true));
    }
    handle(request: Request): Promise<Response> {
        return new Promise((r) => {
            r(new Response('{"name":"Handled!"}'));
        });
    }

    registerRoute(route: IRouter): void {
        route.registerRoute(this);
    }
}

export default class implements IRouter {
    routes: Array<IRoute> = [];
    env: Env;
    ctx: ExecutionContext;
    constructor(env: Env, ctx: ExecutionContext) {
        this.env = env;
        this.ctx = ctx;

        new MyCatchAllRoute(env, ctx)
            .registerRoute(this);

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
            }
        }

        if (route != undefined) {
            return await route.handle(request);
        }


        return new Response('{"state": "Not found"}', { status: 404 });
    }
}