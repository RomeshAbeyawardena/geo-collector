import router from "./router";
import { CoordinateRequestSchema } from "./models/ICoordinate";
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const r = new router(env, ctx);
		return await r.handle(request);
	},
	async queue(batch, env: Env) : Promise<void> {
		const messages = batch.messages;
		
		for (let m of messages) {
			const result = await CoordinateRequestSchema.safeParseAsync(JSON.parse(m.body as string));
			if (result.success){
				m.ack();
				console.log("Recieved: ", result.data);
				//TODO: do something with the dequeued result
			}
			else {
				console.warn("Unable to parse: ", result.error.message);
				//This item failed but it may not be a failure, it might be an item we don't care about and we'll leave it to someone else
			}
		}

	}
} satisfies ExportedHandler<Env>;
