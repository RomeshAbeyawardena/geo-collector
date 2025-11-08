import routeBase from "./route-base";
import { IRouter } from "./route";

export default class extends routeBase {
    name: string = "*";

    constructor(env: Env, ctx: ExecutionContext) {
        super(env, ctx);
    }

    canAcceptRequest(request: Request): Promise<boolean> {
        this.getHeaders(request);
        return this.wrapPromise(true);
    }
    handle(request: Request): Promise<Response> {
        return this.wrapPromise(this.json({
                data: { 
                  result: "Route not found",
                  requestMethod: request.method,
                  requestUrl: request.url
                },
                message: "Unable to find a matching route using " + request.method
            }, 404));
    }

    registerRoute(route: IRouter): void {
        route.registerRoute(this);
    }
}
