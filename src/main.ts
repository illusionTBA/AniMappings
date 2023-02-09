import { prisma } from './db/client';
import { getMappings } from './getMappings';
import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { META } from '@consumet/extensions';
(async () => {
  const app = fastify({ logger: true });

  app.register(fastifyCors);

  app.get('/', async () => {
    return {
      message: 'Welcome to the AniMappings API!',
      routes: {
        '/': 'This page',
        '/anilist/:anilistId': 'Get the Mappings for the given AniList ID',
        '/mal/:malId': 'Get the Mappings for the given Mal ID',
        '/trending':
          'an example integration with a popular anime library consumet - https://github.com/consumet/consumet.ts',
        '/popular': 'another example integration with consumet',
      },
    };
  });

  app.get('/anilist/:id', async (req, res) => {
    const id: number = (req.params as { id: number }).id;
    let only = (req.query as { only: string }).only;
    // if the only param doesnt equel kitsu, anilist, or thetvdb, return an error
    if (
      only &&
      ![
        'kitsu',
        'anilist',
        'thetvdb',
        'anidb',
        'livechart',
        'gogoanimeId',
        'cronchyId',
        'zoroId',
        'tmdb',
        'animeplanet',
        'anisearch',
        'notifymoe',
      ].includes(only)
    )
      return res
        .status(400)
        .send({ message: 'Please provide a valid only param' });
    // console.log(only);
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
        select: {
          // if the only param is provided, only select that mapping
          ...(only && { id: true, anilistId: true, [only]: true }),
          // if the only param is not provided, select all mappings
          ...(only
            ? {}
            : {
                id: true,
                anilistId: true,
                malId: true,
                gogoanimeId: true,
                zoroId: true,
                anidb: true,
                livechart: true,
                animeplanet: true,
                anisearch: true,
                cronchyId: true,
                kitsu: true,
                tmdb: true,
                thetvdb: true,

                notifymoe: false,
              }),
        },
      });
      // if (!mappings) {
      //   // await getMappings(id);
      //   return res.send(await getMappings(id));
      // }
      res.send(await getMappings(id));
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        message: 'An error occurred while processing your request',
      });
    }
  });

  app.get('/mal/:id', async (req, res) => {
    const id: number = (req.params as { id: number }).id;
    if (!id) {
      res.status(400);
      return res.send({ message: 'Provide a MAL id' });
    }
    try {
      const data = await prisma.anime.findUnique({
        where: {
          malId: Number(id),
        },
      });

      return data
        ? res.send(data)
        : res.status(404).send({
            message: 'Sorry, Couldnt find the MAL id in the database',
          });
    } catch (error) {
      console.log(error);
    }
  });

  app.get('/popular', async (req, res) => {
    try {
      const resp: any[] = [];
      const anilist = new META.Anilist();
      const popular = await anilist.fetchPopularAnime();
      await Promise.all(
        popular.results.map(async (anime: any, i: number) => {
          const mappings = await getMappings(anime.id as number);
          resp.splice(popular.results.indexOf(anime), 0, {
            ...anime,
            mappings: mappings,
          });
        }),
      );
      res.send(resp);
    } catch (err) {
      console.log(err);
      res.send('error');
    }
  });
  app.get('/trending', async (req, res) => {
    try {
      const resp: any[] = [];
      const anilist = new META.Anilist();
      const trending = await anilist.fetchTrendingAnime();
      await Promise.all(
        trending.results.map(async (anime: any, i: number) => {
          const mappings = await getMappings(anime.id as number);
          resp.splice(trending.results.indexOf(anime), 0, {
            ...anime,
            mappings: mappings,
          });
          // resp.push({
          //   ...anime,
          //   mappings: mappings,
          // });
        }),
      );
      res.send(resp);
    } catch (err) {
      console.log(err);
      res.send('error');
    }
  });

  app.get('/stats', async (req, res) => {
    try {
      res.send({
        Total: await prisma.anime.count(),
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
