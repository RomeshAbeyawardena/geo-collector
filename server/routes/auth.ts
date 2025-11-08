import { IRouter } from "./route";
import routeBase from "./route-base";
import jwt from '@tsndr/cloudflare-worker-jwt';

export default class extends routeBase {
    name: string = "Auth";

    constructor(env: Env, ctx: ExecutionContext) {
        super(env, ctx);
        this.url = "auth"
        this.accepts.push("GET", "POST");
    }

    async handle(request: Request): Promise<Response> {
        try {
            const authorisation = this.headers["authorization"]

            if (!authorisation) {
                throw "value missing or not specified";
            }

            const token = await jwt.verify(authorisation, "secret");

            if (!token) {
                throw 'failed';
            }
        }
        catch (error) {
            return this.error({
                message: "Unauthorised request",
                detail: `Authorisation header invalid: ${error}`
            }, 401);
        }
        return this.json({
            message: "triggered"
        });
    }

    registerRoute(router: IRouter): void {
        router.registerRoute(this);
    }
}