import { BaseSlashCreator, CommandContext, CommandOptionType, SlashCommand } from 'slash-create';
import { db } from '../db';

export default class PingCommand extends SlashCommand {
	constructor(creator: BaseSlashCreator) {
		super(creator, {
			name: 'start-application',
			description: 'Redeem your invite code and start the application process',
			options: [
				{
					type: CommandOptionType.STRING,
					name: 'code',
					description: 'Your personal invite code',
					required: true,
				},
			],
		});
	}

	async run(ctx: CommandContext) {
		await ctx.defer(true);

		const snowflake = ctx.user.id;
		const codeString = (ctx.options['code'] as string).trim();

		const accessCode = await db.accessCode.findUnique({
			where: {
				code: codeString,
			},
		});

		if (accessCode === null) {
			await ctx.sendFollowUp('This code is invalid. Please double-check the code and try again.\nIf you believe this is an error, please contact the server staff.');
			return;
		}

		if (accessCode.exp !== null && accessCode.exp < new Date()) {
			await ctx.sendFollowUp('This code has expired!');
			return;
		}

		if (accessCode.used_at !== null) {
			await ctx.sendFollowUp('Sorry, this code has already been used.');
			return;
		}

		const inviter = await db.user.findUnique({
			where: {
				snowflake: accessCode.created_by_id,
			},
			select: {
				snowflake: true,
			},
		});

		if (BigInt(snowflake) === inviter?.snowflake) {
			await ctx.sendFollowUp('You cannot use your own invite code!');
			return;
		}

		// TODO reject if user already has an active application or is already a member

		// TODO questionnaire
		const validAnswers = true;

		if (validAnswers) {
			// TODO send application results to webhook for review
			// TODO save application results to database
			console.log(`User ${snowflake} was invited by ${inviter?.snowflake.toString()}`);

			await db.accessCode.update({
				where: {
					code: codeString,
				},
				data: {
					used_at: new Date(),
					used_by: {
						connectOrCreate: {
							where: {
								snowflake: BigInt(snowflake),
							},
							create: {
								snowflake: BigInt(snowflake),
							},
						},
					},
				},
			});

			await ctx.sendFollowUp('Your application has been received.\nPlease be patient while we review your application.');
		}
	}
}
