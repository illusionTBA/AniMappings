import * as stringsim from 'string-similarity';
import { prisma } from './db/client';
import { META, ANIME } from '@consumet/extensions';
import axios from 'axios';
import { ITitle } from '@consumet/extensions/dist/models';
import { load } from 'cheerio';

import {
  kitsu,
  thetvdb,
  zoro,
  gogo,
  cronchy,
  tmdb,
  livechart,
} from './mappings';

export const getMappings = async (anilistId: number) => {
  if (
    await prisma.anime.findFirst({ where: { anilistId: Number(anilistId) } })
  ) {
    console.log('Mappings already exist for this AniList ID ' + anilistId);
    return await prisma.anime.findFirst({
      where: { anilistId: Number(anilistId) },
    });
  }
  try {
    const { data } = await axios.post('https://graphql.anilist.co/', {
      query: `{\n \tMedia(id: ${anilistId}) {\n id\n \t title {\n romaji\n english\n native\n userPreferred\n }\n \t} \n}\n`,
    });
    const anime = data.data.Media;
    const aniId = Number(anime.id);
    const liveChartmappings = await livechart(
      String((anime.title as ITitle).romaji),
    );
    const tvdb = await thetvdb(
      ((anime.title as ITitle).english as string) ??
        ((anime.title as ITitle).romaji as string),
      anime.startDate.year ?? undefined,
    );
    await prisma.anime
      .create({
        data: {
          anilistId: aniId,
          zoroId: await zoro(
            ((anime.title as ITitle).english as string) ??
              (anime.title as ITitle).romaji,
          ),
          gogoanimeId: await gogo(
            ((anime.title as ITitle).romaji as string) ??
              (anime.title as ITitle).english,
          ),
          cronchyId: await cronchy(
            ((anime.title as ITitle).english as string) ??
              (anime.title as ITitle).romaji,
          ),
          kitsu: await kitsu(
            ((anime.title as ITitle).romaji as string) ??
              (anime.title as ITitle).english,
          ),
          thevdb: tvdb,
          tmdb: tvdb ? await tmdb(tvdb.id) : undefined,
          // notifymoe: await getMappingsNotifyMoe(
          //   String((anime.title as ITitle).romaji),
          // ),
          anidb:
            liveChartmappings.ext_sources.anidb.length > 0
              ? liveChartmappings.ext_sources.anidb[0].id ??
                'Failed to get mappings for AniDB'
              : 'Failed to get mappings for AniDB',
          anisearch:
            liveChartmappings.ext_sources.anisearch.length > 0
              ? liveChartmappings.ext_sources.anisearch[0].id
              : 'Failed to get mappings for AniSearch',

          livechart:
            liveChartmappings.livechart ??
            'Failed to get mappings for LiveChart',
          animeplanet:
            liveChartmappings.ext_sources.anime_planet.length > 0
              ? liveChartmappings.ext_sources.anime_planet[0].id
              : 'Failed to get mappings for anime planet',
        },
      })
      .then(async () => {
        console.log(
          `[+] Mappings for ${
            ((anime.title as ITitle).romaji as string) ??
            (anime.title as ITitle).english
          } have been added`,
        );
        return await prisma.anime.findFirst({ where: { anilistId: aniId } });
      });
  } catch (error: any) {
    console.error(error.message);
    if (error.message === 'Media not found') {
      return {
        message:
          'An error occurred while processing your request. Please make sure this is a valid AniList ID',
        error: error.message,
      };
    }
    console.log(error);
    return {
      message:
        'An error occurred while processing your request. Please make sure this is a valid AniList ID',
    };
  }
};
