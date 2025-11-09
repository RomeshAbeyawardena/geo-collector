import routeBase from "./route-base";

export default abstract class extends routeBase {
    protected readonly request: Record<string, string|any|File|null> = {};

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

    async handle(request: Request): Promise<Response> {
        try {
        const headerContentType = this.headers["content-type"] || "";
        if (headerContentType === "application/json") {
            const jsonData : Record<string,any> = await request.json()

            for (let key in jsonData) {
                if (Object.prototype.hasOwnProperty.call(jsonData, key))
                {
                    this.request[key] = jsonData[key];
                }
            }

            return await this.handleJsonRequest(request);
        } else if (headerContentType.startsWith("multipart/form-data")
            || headerContentType.startsWith("application/x-www-form-urlencoded")) {
            const formData = await request.formData();

            formData.forEach((value, key) => this.request[key] = value);
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