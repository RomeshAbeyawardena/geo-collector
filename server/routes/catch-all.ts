import routeBase from "./route-base";
import { IRouter } from "../route";

export default class extends routeBase {
    name: string = "*";

    constructor(env: Env, ctx: ExecutionContext) {
        super(env, ctx);
    }

    canAcceptRequest(request: Request): Promise<boolean> {

        return new Promise((r) => r(true));
    }
    handle(request: Request): Promise<Response> {
        return new Promise((r) => {
            r(this.json({
                data: { 
                  result: "Route not found"  
                },
                message: "Unable to find a matching route using " + request.method
            }, 404));
        });
    }

    registerRoute(route: IRouter): void {
        route.registerRoute(this);
    }
}
