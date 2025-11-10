import { IUserSecurity, UserSecuritySchema } from "../../models/IUserSecurity";
import { IRouter } from "../route";
import routeBase from "../route-base";
import jwt from '@tsndr/cloudflare-worker-jwt';

export default class extends routeBase {
    name: string = "Auth";

    constructor(env: Env, ctx: ExecutionContext) {
        super(env, ctx);
        this.url = "auth/introspect"
        this.accepts.push("GET", "POST");
    }

    async handle(request: Request): Promise<Response> {
        try {
            const authorisation = this.headers["authorization"]

            if (!authorisation) {
                throw "value missing or not specified";
            }
            
            /*const testPayload: IUserSecurity = {
                email: "test@user.com",
                name:"Test User",
                sub: "526c1a6c-4021-4a24-8142-a0587c90833a",
                scopes: "scope:read,scope:write"
            };
            
            const jsonToken = await jwt.sign(testPayload, "secret");

            console.log(jsonToken);*/
            const token = await jwt.verify(authorisation, this.env.application_secret);
            
            if (!token) {
                throw 'failed';
            }

            const result = await UserSecuritySchema.safeParseAsync(token.payload);

            if (!result.success){
                throw result.error;
            }
            
            return this.json({ 
                data: result.data,
                message: "Payload is valid"
            }, 200);
        }
        catch (error) {
            return this.error({
                message: "Unauthorised request",
                details: `Authorisation header invalid: ${error}`
            }, 401);
        }
    }

    registerRoute(router: IRouter): void {
        router.registerRoute(this);
    }
}