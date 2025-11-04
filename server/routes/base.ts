import { IRoute, IRouter } from "../route";

import { Env, ExecutionContext, Request, Response } from "../../worker-configuration";

export default abstract class implements IRoute {
    env: Env;
    ctx: ExecutionContext;

    protected accepts: Array<string> = [];
    protected url?: string;

    constructor(env: Env, ctx: ExecutionContext) {
        this.env = env;
        this.ctx = ctx;
    }

    abstract name: string;
    canAcceptRequest(request: Request): Promise<boolean> {
        let result = true;

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