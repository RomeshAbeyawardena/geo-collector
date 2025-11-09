import { RequestError } from "./request-error";
import routeBase from "./route-base";

export default abstract class extends routeBase {
    protected readonly request: Record<string, string | any | File | null> = {};

    protected async handleFormRequest(request: Request): Promise<Response> {
        return this.json({
            message: "Form Unhandled"
        }, 501);
    }
    protected async handleJsonRequest(request: Request): Promise<Response> {
        return this.json({
            message: "JSON Unhandled"
        }, 501);
    }

    protected async handleDefault(request: Request): Promise<Response> {
        return this.json({
            message: "Default unhandled"
        }, 501);
    }

    async handleError(error:unknown) : Promise<Response> {
        if (error instanceof RequestError) {
            return this.error({
                message: error.message,
                details: error.details
            }, error.statusCode);
        }

        if (error instanceof Error) {
            return this.error({
                message: error.message,
                details: error.cause as string
            }, 500);
        }

        return this.error({
            message: error as string
        }, 500)
    }

    async handle(request: Request): Promise<Response> {
        try {
            this.populateQueryStringValues(request, this.request);
            const headerContentType = this.headers["content-type"] || "";
            if (headerContentType === "application/json") {
                const jsonData: Record<string, any> = await request.json()

                for (let key in jsonData) {
                    if (Object.prototype.hasOwnProperty.call(jsonData, key)) {
                        this.request[key.trim()] = jsonData[key];
                    }
                }
                return await this.handleJsonRequest(request);
            } else if (headerContentType.startsWith("multipart/form-data")
                || headerContentType.startsWith("application/x-www-form-urlencoded")) {
                const formData = await request.formData();
                formData.forEach((value, key) => this.request[key.trim()] = value);
                return await this.handleFormRequest(request);
            } else {
                return await this.handleDefault(request);
            }
        }
        catch (error) {
            return await this.handleError(error);
        }
    }
}