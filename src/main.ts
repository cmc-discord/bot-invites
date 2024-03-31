import Fastify from 'fastify';
import { FastifyServer, SlashCreator } from 'slash-create';
import { statusPage } from './server/status';
import path from 'path';
import env from './env';
import { db } from './db';

env.init();

const prisma = db;

const fastify = Fastify({
	logger: true,
});
fastify.get('/', statusPage);

const slash = new SlashCreator({
	applicationID: env.get('DISCORD_APPLICATION_ID'),
	publicKey: env.get('DISCORD_PUBLIC_KEY'),
	token: env.get('DISCORD_BOT_TOKEN'),
})
	.withServer(new FastifyServer(fastify, { alreadyListening: true }));

async function main() {

	const start = Date.now();

	const registeredCommands = await slash.registerCommandsIn(path.join(__dirname, 'commands'), ['.ts', '.js']);
	console.log(`Loaded ${registeredCommands.length} commands.`);

	await fastify.listen({
		port: 3001,
	});

	if (env.getOrDefault('DISCORD_REGISTER_COMMANDS', 'false').toLowerCase() !== 'false') {
		if (registeredCommands.length > 0) {
			console.log('Registering commands...');
			await slash.syncCommands({ deleteCommands: true });
		}
		else {
			console.error('No commands to register.');
		}
	}

	const end = Date.now();

	console.log(`Started! (${end - start}ms)`);
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
