import router from "./router";
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const r = new router(env, ctx);
		return await r.handle(request);
	},
} satisfies ExportedHandler<Env>;
