import routeBase from "./route-base";

export default abstract class extends routeBase {
    protected async handleFormRequest(request: Request): Promise<Response> {
        return this.json({
            message: "Form Unhandled"
        });
    }
    protected async handleJsonRequest(request: Request): Promise<Response> {
        return this.json({
            message: "JSON Unhandled"
        });
    }

    protected async handleDefault(request: Request): Promise<Response> {
        return this.json({
            message: "Default unhandled"
        });
    }

    async handle(request: Request): Promise<Response> {
        try {
        const headerContentType = this.headers["content-type"] || "";
        if (headerContentType === "application/json") {
            return await this.handleJsonRequest(request);
        } else if (headerContentType.startsWith("multipart/form-data")
            || headerContentType.startsWith("application/x-www-form-urlencoded")) {
            return await this.handleFormRequest(request);
        } else {
            return await this.handleDefault(request);
        }
        }
        catch(error) {
             const detail = error instanceof Error ? error.message : String(error);

            return this.error({
                message:"An error occurred.",
                detail: detail
            });
        }
    }
}