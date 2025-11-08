import { IRouter } from "./route";
import routeBase from "./route-base";

export default class extends routeBase {
    name: string = "Begin auth";

    constructor(env: Env, ctx: ExecutionContext) {
        super(env, ctx);
        this.url = "auth";
        this.accepts.push("POST");
    }

    async handle(request: Request): Promise<Response> {
        return this.json({
            message: "Hello world!"
        });
    }

    registerRoute(router: IRouter): void {
        router.registerRoute(this);
    }
}