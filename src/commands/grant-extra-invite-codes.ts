import { BaseSlashCreator, CommandContext, CommandOptionType, SlashCommand } from 'slash-create';
import { db } from '../db';
import { userMention } from '@discordjs/formatters';

export default class PingCommand extends SlashCommand {
	constructor(creator: BaseSlashCreator) {
		super(creator, {
			name: 'grant-additional-invites',
			description: 'Grant additional invite codes to a user',
			options: [
				{
					type: CommandOptionType.USER,
					name: 'user',
					description: 'The user',
					required: true,
				},
				{
					type: CommandOptionType.INTEGER,
					name: 'amount',
					description: 'The amount of invite codes to grant (default: 1)',
					required: false,
				},
			],
		});
	}

	async run(ctx: CommandContext) {
		await ctx.defer(false);

		const snowflake = ctx.options['user'] as string;
		const amount = ctx.options['amount'] || 1;

		await db.user.upsert({
			where: {
				snowflake: BigInt(snowflake),
			},
			update: {
				extra_codes: {
					increment: amount,
				},
			},
			create: {
				snowflake: BigInt(snowflake),
				extra_codes: amount,
			},
		});

		const mention = userMention(snowflake);

		await ctx.sendFollowUp(`${mention} has been granted ${amount} additional invite ${amount === 1 ? 'code' : 'codes'}`);
	}
}
