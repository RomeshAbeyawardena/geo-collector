import router from "./router";
import { ExecutionContext } from "@cloudflare/workers-types"
import { Request, Env, ExportedHandler } from "../worker-configuration";

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const r = new router(env, ctx);
		return await r.handle(request);
	},
} satisfies ExportedHandler<Env>;
