import { IRoute, IRouter } from "../route";

export default abstract class implements IRoute {
    env: Env;
    ctx: ExecutionContext;

    protected accepts: Array<string> = [];
    protected url?: string;

    protected readonly headers: Record<string, string> = {};

    static instance<T extends IRoute>(
        ctor: new (env: Env, ctx: ExecutionContext) => T,
        env: Env,
        ctx: ExecutionContext
    ): T {
        return new ctor(env, ctx);
    }

    constructor(env: Env, ctx: ExecutionContext) {
        this.env = env;
        this.ctx = ctx;
    }

    abstract name: string;
    canAcceptRequest(request: Request): Promise<boolean> {
        let result = true;

        const headers = request.headers;

        headers.forEach((v, h) => {
            this.headers[h] = v;
        });

        if (this.accepts.length) {
            result = this.accepts.includes(request.method);
        }

        if (this.url) {
            result = request.url.endsWith(this.url);
        }

        return new Promise((r) => r(result));
    }
    abstract handle(request: Request): Promise<Response>;
    abstract registerRoute(router: IRouter): void;
}