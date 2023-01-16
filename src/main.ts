import { prisma } from './db/client';
import { getMappings } from './getMappings';
import fastify from 'fastify';
import fastifyCors from '@fastify/cors';

(async () => {
  const app = fastify({ logger: true });

  app.register(fastifyCors);

  app.get('/', async () => {
    return {
      message: 'Welcome to the AniMappings API!',
      routes: {
        '/': 'This page',
        '/:anilistId': 'Get the Mappings for the given AniList ID',
      },
    };
  });

  app.get('/:id', async (req, res) => {
    const id: number = (req.params as { id: number }).id;
    if (isNaN(id)) {
      return res.status(400).send({
        message: 'Please provide a valid AniList ID',
      });
    }
    try {
      const mappings = await prisma.anime.findFirst({
        where: {
          anilistId: Number(id),
        },
      });
      if (!mappings) {
        await getMappings(id);
        return res.send(await getMappings(id));
      }
      res.send(mappings);
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        message: 'An error occurred while processing your request',
      });
    }
  });

  app.listen({
    port: 3000,
  });
})();
