import router from "./router";
import DefaultMessageDelegateHandler from "./messages/DefaultMessageDelegateHandler";
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const r = new router(env, ctx);
		return await r.handle(request);
	},
	async queue(batch, env: Env) : Promise<void> {
		const messages = batch.messages;
		
		const defaultMessageDelegateHandler = new DefaultMessageDelegateHandler();

		for (let m of messages) {

			const result = JSON.parse(m.body as string);
			if (await defaultMessageDelegateHandler.canHandle(result))
			{
				await defaultMessageDelegateHandler.handle(result);
				m.ack();
			}
			else {
				console.warn(`Processing skipped for ${m.id}`);
			}
		}

	}
} satisfies ExportedHandler<Env>;
