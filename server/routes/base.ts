import { IRoute, IRouter } from "../route";

export default abstract class implements IRoute {
    env: Env;
    ctx: ExecutionContext;

    protected accepts: Array<string> = [];

    constructor(env: Env, ctx: ExecutionContext) {
        this.env = env;
        this.ctx = ctx;
    }

    abstract name: string;
    canAcceptRequest(request: Request): Promise<boolean> {
        let result = false;

        if (this.accepts.length < 1) {
            //accepts anything
            result = true;
        }
        else if (this.accepts.includes(request.method)) {
            //acceptance restrictions pass
            result = true;
        }

        return new Promise((r) => r(result));
    }
    abstract handle(request: Request): Promise<Response>;
    abstract registerRoute(router: IRouter): void;
}