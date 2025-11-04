import { IRouter } from "../route";

import base from "./base";
import { ExecutionContext } from "@cloudflare/workers-types"

export default class extends base {
    name: string = "Geo";

    constructor(env: Env, ctx: ExecutionContext) {
        super(env, ctx);
    }

    canAcceptRequest(request: Request): Promise<boolean> {
        let canAcceptRequest = false;
        if (request) {

        }
        return new Promise(r => r(canAcceptRequest));
    }
    handle(request: Request): Promise<Response> {
        throw new Error("Method not implemented.");
    }

    registerRoute(router: IRouter): void {
        router.registerRoute(this);
    }

}