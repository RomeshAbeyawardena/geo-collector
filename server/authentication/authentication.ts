import AzureAuthApi from "../azure/auth";

export default abstract class {
    protected azureAuthApi: AzureAuthApi;
    protected env: Env;
    constructor(env: Env) {
        this.env = env;
        this.azureAuthApi = new AzureAuthApi(env.azure_auth_endpoint);
    }

    async getAuthToken(): Promise<string | undefined> {
        const beginAuth = this.azureAuthApi.beginAuth;

        const serverToken = await beginAuth.loadToken(this.env);
        console.log("Cached token", serverToken);
        let serverJwtT: string | undefined;

        if (!serverToken) {
            const authToken = await beginAuth.prepareToken(this.env, this.env.machine_id, this.env.application_secret);
            const result = await beginAuth.post(authToken);

            if (result.data) {
                serverJwtT = result.data.token;
                await beginAuth.saveToken(this.env, serverJwtT);
            }
        }
        else {
            serverJwtT = serverToken.token;
        }

        console.log(serverJwtT);
        return serverJwtT;
    }
}