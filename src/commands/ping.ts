import { BaseSlashCreator, CommandContext, Message, SlashCommand } from 'slash-create';

export default class PingCommand extends SlashCommand {
	constructor(creator: BaseSlashCreator) {
		super(creator, {
			name: 'ping',
			description: '🏓',
		});
	}

	async run(ctx: CommandContext) {
		const start = Date.now();
		const resp = await ctx.send('Pinging...');
		const end = Date.now();
		let msgId: string;
		if (typeof resp === 'boolean') {
			msgId = ctx.messageID!;
		}
		else {
			msgId = (resp as Message).id;
		}
		await ctx.edit(msgId, `Pong! ${end - start}ms.`);
	}
}
