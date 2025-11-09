import { UserAuthentication } from "../models/IAuthenticatedUser";
import { IRouter } from "./route";
import routeController from "./route-controller";


export default class extends routeController {
    name: string = "Begin auth";
    userAuth: UserAuthentication;
    constructor(env: Env, ctx: ExecutionContext) {
        super(env, ctx);
        this.userAuth = new UserAuthentication(env);
        this.url = "auth";
        this.accepts.push("POST");
    }

    protected async handleFormRequest(request: Request): Promise<Response> {
        const authenticatedUser = await this.userAuth.authenticate(await UserAuthentication
            .getUserRequest(this.request));

        return this.json({
            data: authenticatedUser,
            message: "Form handler"
        });
    }

    registerRoute(router: IRouter): void {
        router.registerRoute(this);
    }
}