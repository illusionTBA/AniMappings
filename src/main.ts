import { prisma } from './db/client';
import { getMappings } from './getMappings';
import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { META } from '@consumet/extensions'
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
  app.get('/trending', async (req, res) => {
	try {
	const resp: any[] = []
	const anilist = new META.Anilist();
	const trending = await anilist.fetchTrendingAnime()
	await Promise.all(trending.results.map(async(anime: any, i: number) => {
		const mappings = await getMappings(anime.id as number)
		resp.push({
		 	...anime,
			mappings: mappings
		})
	}))
	res.send(resp)
	} catch (err) {
		console.log(err)
		res.send("error")

	}
  }) 
  app.get('/stats', async (req, res) => {
    try {
      const all = await prisma.anime.findMany();
      const total = all.length;
      res.send({
        Total: total,
        // AniList: all.filter((a) => a.anilistId).length ?? 0,
        // TheTVDB: all.filter((a) => a.thevdb).length ?? 0,
        // Kitsu: all.filter((a) => a.kitsu).length ?? 0,
        // Cronchy: all.filter((a) => a.cronchyId).length ?? 0,
        // Zoro: all.filter((a) => a.zoroId).length ?? 0,
        // GogoAnime: all.filter((a) => a.gogoanimeId).length ?? 0,
        // AniDB: all.filter((a) => a.anidb).length ?? 0,
        // LiveChart: all.filter((a) => a.livechart).length ?? 0,
      });
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
