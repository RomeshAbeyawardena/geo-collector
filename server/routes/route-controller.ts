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

    handle(request: Request): Promise<Response> {
        const headerContentType = this.headers["content-type"] || "";
        if (headerContentType === "application/json") {
            return this.handleJsonRequest(request);
        } else if (headerContentType.startsWith("multipart/form-data")) {
            return this.handleFormRequest(request);
        } else {
            return this.handleDefault(request);
        }
    }
}