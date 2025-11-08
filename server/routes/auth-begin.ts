import { IRouter } from "./route";
import routeController from "./route-controller";


export default class extends routeController {
    name: string = "Begin auth";

    constructor(env: Env, ctx: ExecutionContext) {
        super(env, ctx);
        this.url = "auth";
        this.accepts.push("POST");
    }

    protected async handleFormRequest(request: Request): Promise<Response> {
        return this.json({
            message: "Form handler"
        });
    }

    registerRoute(router: IRouter): void {
        router.registerRoute(this);
    }
}