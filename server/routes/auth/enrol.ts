import userAuthentication from "../../authentication/user-authentication";
import { UserRegistrationRequestSchema } from "../../models/IAuthenticatedUser";
import { RequestError } from "../request-error";
import { IRouter } from "../route";
import routeController from "../route-controller";

export default class extends routeController {
    name:string = "Enroll auth"
    userAuthentication: userAuthentication;
    constructor(env: Env, ctx: ExecutionContext) {
        super(env, ctx);
        this.userAuthentication = new userAuthentication(env);
        this.url = "auth/enroll";
        this.accepts.push("POST");
    }

    protected async handleFormRequest(request: Request): Promise<Response> {
        const result = await UserRegistrationRequestSchema.safeParseAsync(this.request);

        if (!result.success)
        {
            throw new RequestError("Validation failed", 400, result.error.message);
        }

        await this.userAuthentication.registerUser(result.data);

        return this.json({
            message: "Enrollment handler"
        });
    }

    registerRoute(router: IRouter): void {
        router.registerRoute(this);
    }
}