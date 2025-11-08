import { IRoute, IRouter } from "../route";

export interface MessageState {
    message: string;
    detail?: string;
}

export interface ErrorState extends MessageState {
    automationId?: string;
    code?: number;
    continuationId?: string;
}

export interface Result extends MessageState {
    data?: any
}

export default abstract class implements IRoute {
    env: Env;
    ctx: ExecutionContext;

    protected accepts: Array<string> = [];
    protected url?: string;

    protected readonly headers: Record<string, string> = {};

    protected json(result: Result, statusCode?: number) {
        return new Response(JSON.stringify(result), { status: statusCode });
    }

    protected error(state: ErrorState, statusCode?: number): Response {
        return new Response(JSON.stringify(state), {
            status: statusCode ?? 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    protected wrapPromise<T>(value:T) : Promise<T> {
        return new Promise(r => r(value));
    }

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
            //shortcircuit
            if(!result) {
                return this.wrapPromise(result);
            }
        }

        if (this.url) {
            result = request.url.endsWith(this.url);
        }

        return this.wrapPromise(result);
    }
    abstract handle(request: Request): Promise<Response>;
    abstract registerRoute(router: IRouter): void;
}