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
  Malsync,
  fribbList
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
      query: `{
  Media(id:${anilistId}) {
    id
    idMal
    startDate{
			year
    }
    title {
      romaji
      english
      native
      userPreferred
    }
    
  }
}`,
    });
    const anime = data.data.Media;
    const aniId = Number(anime.id);
    //const liveChartmappings = await livechart(
    //  String((anime.title as ITitle).romaji),
    //);
    const fribb = await fribbList(anime.idMal as number)
    const malsync = await Malsync(anime.idMal as number);
    const tvdb = await thetvdb(
      ((anime.title as ITitle).english as string) ??
        ((anime.title as ITitle).romaji as string),
      anime.startDate.year ?? undefined,
    );
    await prisma.anime
      .create({
        data: {
          anilistId: aniId,
          malId: anime.idMal,
          zoroId:
            anime.idMal !== undefined && malsync && malsync.Zoro
              ? (Object.values(malsync.Zoro)[0] as any).url.replace(
                  'https://zoro.to/',
                  '',
                )
              : await zoro(
                  ((anime.title as ITitle).english as string) ??
                    (anime.title as ITitle).romaji,
                ),
          gogoanimeId:
            anime.idMal !== undefined && malsync && malsync.Gogoanime
              ? (Object.values(malsync.Gogoanime)[0] as any).identifier
              : await gogo(
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
          thetvdb: tvdb,
          tmdb: tvdb ? await tmdb(tvdb.id) : undefined,
          anidb: fribb.anidb_id ?? undefined,
          anisearch:fribb.anisearch_id ?? undefined,
          livechart: fribb.livechart_id ?? await livechart(
      String((anime.title as ITitle).romaji),
        ),
          animeplanet:fribb["anime-planet_id"] ?? undefined,
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


//(async() => {
//	await prisma.anime.deleteMany()
//	await getMappings(21)
//	console.log(await getMappings(21))

//})() 
