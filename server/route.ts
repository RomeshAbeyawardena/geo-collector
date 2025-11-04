import { Env, ExecutionContext, Request, Response } from '../worker-configuration';

export interface IRouteHandler {
    handle(request: Request): Promise<Response>;
}

export interface IRoute extends IRouteHandler, IRegisterable {
    name: string;
    env: Env;
    ctx: ExecutionContext;
    canAcceptRequest(request: Request): Promise<boolean>;
}

export interface IRegisterable {
    registerRoute(router: IRouter): void;
}


export interface IRouter extends IRouteHandler {
    registerRoute(route: IRoute): void;
    env: Env;
    ctx: ExecutionContext;
}
