import { BaseSlashCreator, CommandContext, SlashCommand } from 'slash-create';
import { db } from '../db';
import { time } from '@discordjs/formatters';

export default class PingCommand extends SlashCommand {
	constructor(creator: BaseSlashCreator) {
		super(creator, {
			name: 'create-invite',
			description: 'generate an invite code',
		});
	}

	async run(ctx: CommandContext) {
		await ctx.defer(true);

		const user = await db.user.upsert({
			where: {
				snowflake: BigInt(ctx.user.id),
			},
			update: {},
			create: {
				snowflake: BigInt(ctx.user.id),
			},
			select: {
				snowflake: true,
				available_codes: true,
				extra_codes: true,
			},
		});

		if ((user.available_codes + user.extra_codes) > 0) {

			// set default expiry date 7 days from now
			const exp = new Date();
			exp.setDate(exp.getDate() + 7);

			const accessCode = await db.accessCode.create({
				data: {
					created_by: {
						connect: {
							snowflake: user.snowflake,
						},
					},
					exp,
				},
				select: {
					code: true,
				},
			});

			await ctx.sendFollowUp(`Here is your invite code: ||\`${accessCode.code}\`||\nThis is a personalized code and should not be shared publicly.\n\nExpires: ${time(exp, 'R')}`);

			// staff overrides first, then decrement regular codes
			if (user.extra_codes > 0) {
				await db.user.update({
					where: { snowflake: user.snowflake },
					data: {
						extra_codes: user.extra_codes - 1,
					},
				});
			}
			else {
				await db.user.update({
					where: { snowflake: user.snowflake },
					data: {
						available_codes: user.available_codes - 1,
					},
				});
			}
		}
		else {
			await ctx.sendFollowUp('Sorry, you cannot create more invite codes at the moment.\n\nYou can earn more by being active in the community.\nIn some cases, staff members may be able to increase your limit as well.');
		}

	}
}
