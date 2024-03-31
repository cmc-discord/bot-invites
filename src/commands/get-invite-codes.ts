import { BaseSlashCreator, CommandContext, SlashCommand } from 'slash-create';
import { db } from '../db';
import { time } from '@discordjs/formatters';

export default class PingCommand extends SlashCommand {
	constructor(creator: BaseSlashCreator) {
		super(creator, {
			name: 'get-invites',
			description: 'See how many invites you have earned so far',
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
				codes_created: {
					select: {
						code: true,
						created_at: true,
						used_at: true,
						exp: true,
					},
				},
			},
		});

		let msg = '';

		const now = new Date();
		const activeCodes = user.codes_created.filter(c => {
			return c.used_at === null && (c.exp === null || c.exp > now);
		});
		if (activeCodes.length > 0) {
			msg += `You have ${activeCodes.length} active invite ${(activeCodes.length === 1) ? 'code' : 'codes'}:\n`;
			activeCodes.forEach(c => {
				msg += `||\`${c.code}\`|| created at ${time(c.created_at, 'f')}`;
				if (c.exp) {
					msg += `, expires ${time(c.exp, 'R')}`;
				}
				msg += '\n';
			});
			msg += '\n';
		}

		const codes = user.available_codes + user.extra_codes;

		if (codes > 0) {
			msg += `You can create ${codes} more invite ${(codes === 1) ? 'code' : 'codes'}.`;
		}
		else {
			msg += 'You currently cannot create any more invite codes.';
		}

		msg += '\n\nYou can earn more by being active in the community.\nIn some cases, staff members may be able to grant you additional codes.';

		await ctx.sendFollowUp(msg);
	}
}
