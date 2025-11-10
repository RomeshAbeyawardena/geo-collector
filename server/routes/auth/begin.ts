import UserAuthentication from "../../authentication/user-authentication";
import { IRouter } from "../route";
import routeController from "../route-controller";


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
        await this.userAuth.prepareDB();

        const authenticatedUser = await this.userAuth.authenticate(await UserAuthentication
            .getUserRequest(this.request));
        
        console.log(authenticatedUser);
        const isValid = authenticatedUser != undefined;
        
        return this.json({
            data: authenticatedUser,
            message: isValid ? "User authentication passed" : "User authentication failed"
        }, isValid ? 200 : 401);
    }

    registerRoute(router: IRouter): void {
        router.registerRoute(this);
    }
}