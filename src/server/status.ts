import { FastifyReply, FastifyRequest } from 'fastify';

export const statusPage = async (req: FastifyRequest, res: FastifyReply) => {
	res.send({ status: 200, message: 'ok' });
};
