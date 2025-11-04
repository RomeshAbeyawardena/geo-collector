import { IRoute, IRouter } from "../route";

export default abstract class implements IRoute {
    env: Env;
    ctx: ExecutionContext;

    constructor(env: Env, ctx: ExecutionContext) {
        this.env = env;
        this.ctx = ctx;
    }

    abstract name: string;
    abstract canAcceptRequest(request: Request): Promise<boolean>;
    abstract handle(request: Request): Promise<Response>;
    abstract registerRoute(router: IRouter): void;
}