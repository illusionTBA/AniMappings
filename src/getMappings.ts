import * as stringsim from 'string-similarity';
import { prisma } from './db/client';
import { META } from '@consumet/extensions';
import axios from 'axios';
import { ITitle } from '@consumet/extensions/dist/models';
import { load } from 'cheerio';
export const getMappings = async (anilistId: number) => {
  const anilist = new META.Anilist();
  if (
    await prisma.anime.findFirst({ where: { anilistId: Number(anilistId) } })
  ) {
    console.log('Mappings already exist for this AniList ID ' + anilistId);
    return await prisma.anime.findFirst({
      where: { anilistId: Number(anilistId) },
    });
  }
  try {
    const anime = await anilist.fetchAnilistInfoById(String(anilistId));
    console.log(anime);
    const aniId = Number(anime.id);
    console.log(anime.title);
    const liveChartmappings = await getMappingsLiveChart(
      String((anime.title as ITitle).romaji),
    );
    await prisma.anime
      .create({
        data: {
          anilistId: aniId,

          kitsu: await getMappingsKitsu(
            ((anime.title as ITitle).romaji as string) ??
              (anime.title as ITitle).english,
          ),
          thevdb: await getMappingsTvdb(
            ((anime.title as ITitle).romaji as string) ??
              (anime.title as ITitle).english,
            anime.releaseDate,
          ),
          notifymoe: await getMappingsNotifyMoe(
            String((anime.title as ITitle).romaji),
          ),
          anidb: liveChartmappings.ext_sources.anidb[0].id,
          anisearch: liveChartmappings.ext_sources.anisearch[0].id,

          livechart: liveChartmappings.livechart,
          animeplanet:
            (liveChartmappings.ext_sources as any).anime_planet[0].id ?? null,
        },
      })
      .then(async () => {
        console.log('created');
        return await prisma.anime.findFirst({ where: { anilistId: aniId } });
      });
  } catch (error) {
    console.error(error);
    return {
      message:
        'An error occurred while processing your request. Please make sure this is a valid AniList ID',
    };
  }
};

// getMappings(21);

const getMappingsKitsu = async (title: string) => {
  const { data: kData } = await axios.get(
    `https://kitsu.io/api/edge/anime?filter[text]=${title}`,
  );
  const bestMatch = stringsim.findBestMatch(
    title,
    kData.data.map(
      (d: any) => d.attributes.titles.en_jp ?? d.attributes.titles.en,
    ),
  );
  // console.log(bestMatch);
  // console.log(kData.data[bestMatch.bestMatchIndex].id);
  return kData.data[bestMatch.bestMatchIndex];
};

const getMappingsTvdb = async (title: string, year?: string) => {
  console.log('starting');
  const { data: tvdbData } = await axios.post(
    'https://tvshowtime-1.algolianet.com/1/indexes/*/queries?x-algolia-agent=Algolia%20for%20vanilla%20JavaScript%20(lite)%203.32.0%3Binstantsearch.js%20(3.5.3)%3BJS%20Helper%20(2.28.0)&x-algolia-application-id=tvshowtime&x-algolia-api-key=c9d5ec1316cec12f093754c69dd879d3',
    {
      requests: [
        {
          indexName: 'TVDB',
          params: `query=${title}&hitsPerPage=400&page=0`,
        },
      ],
    },
  );
  // console.log(tvdbData.results[tvdbData.results.length - 1].hits[0]);
  try {
    const bestMatch = stringsim.findBestMatch(
      title,
      await tvdbData.results[0].hits.map((d: any) => {
        const title = String(
          d.translations.por ?? d.translations.eng ?? d.name,
        );
        if (d.type === 'movies' || d.type === 'series') {
          if (year === undefined) {
            return title;
          }
          console.log('Checking ' + title + ' with the year ' + year);
          if (d.year === String(year)) {
            // console.log('Matched ' + title + ' with the year ' + year);
            return title;
          } else {
            // console.log('No match for ' + title + ' with the year ' + year);
            return 'NO MATCH YEAR';
          }
        } else {
          return 'NO MATCH TYPE';
        }
      }),
    );
    return tvdbData.results[0].hits[bestMatch.bestMatchIndex];
  } catch (error) {
    console.log('error occurred');
    console.error(error);
    return {
      message: 'An error occurred while getting tvdb mappings',
    };
  }

  // console.log(bestMatch);
};
const getMappingsNotifyMoe = async (title: string) => {
  const res: any[] = [];
  try {
    const { data: notifyData } = await axios.get(
      `https://notify.moe/search/${title}`,
    );

    const $ = load(notifyData);

    $('.anime-search > a').each((i, e) => {
      res.push({
        title: $(e).attr('aria-label'),
        id: $(e).attr('href')?.split('/')[2],
      });
    });

    const bestMatch = stringsim.findBestMatch(
      title,
      res.map((d) => d.title),
    );

    const { data: NotifyApi } = await axios.get(
      `https://notify.moe/api/anime/${res[bestMatch.bestMatchIndex].id}`,
    );
    return NotifyApi;
  } catch (error) {
    console.error(error);
    return {
      message: 'An error occurred while getting notify.moe mappings',
    };
  }
};

const getMappingsLiveChart = async (title: string) => {
  const res: any[] = [];

  const { data: liveChart } = await axios.get(
    `https://www.livechart.me/search?q=${title}`,
  );

  const $ = load(liveChart);

  $('div.callout.grouped-list.anime-list > li.anime-item').each((i, e) => {
    res.push({
      title: $(e).attr('data-title'),
      id: $(e).attr('data-anime-id'),
    });
  });

  const bestMatch = stringsim.findBestMatch(
    title,
    res.map((d) => d.title),
  );
  // console.log(res);

  const ext_sources: any = {
    anilist: [],
    myanimelist: [],
    anidb: [],
    anime_planet: [],
    anisearch: [],
    kitsu: [],
  };

  const { data: liveChartApi } = await axios.get(
    `https://www.livechart.me/anime/${res[bestMatch.bestMatchIndex].id}`,
  );

  const $$ = load(liveChartApi);

  $$('div.row.small-up-2.medium-up-3 > div.column.column-block').each(
    (i, el) => {
      const source = $$(el).find('a');
      if (source.hasClass('anilist-button')) {
        ext_sources.anilist.push({
          name: 'anilist',
          url: source.attr('href'),
          id: source.attr('href')?.replace('https://anilist.co/anime/', ''),
        });
      } else if (source.hasClass('myanimelist-button')) {
        ext_sources.myanimelist.push({
          name: 'myanimelist',
          url: source.attr('href'),
          id: source
            .attr('href')
            ?.replace('https://myanimelist.net/anime/', ''),
        });
      } else if (source.hasClass('anidb-button')) {
        ext_sources.anidb.push({
          name: 'anidb',
          url: source.attr('href'),
          id: source.attr('href')?.replace('http://anidb.net/a', ''),
        });
      } else if (source.hasClass('anime_planet-button')) {
        ext_sources.anime_planet.push({
          name: 'anime_planet',
          url: source.attr('href'),
          id: source
            .attr('href')
            ?.replace('http://www.anime-planet.com/anime/', ''),
        });
      } else if (source.hasClass('anisearch-button')) {
        ext_sources.anisearch.push({
          name: 'anisearch',
          url: source.attr('href'),
          id: source
            .attr('href')
            ?.replace('https://www.anisearch.com/anime/', ''),
        });
      } else if (source.hasClass('kitsu-button')) {
        ext_sources.kitsu.push({
          name: 'kitsu',
          url: source.attr('href'),
          id: source.attr('href')?.replace('https://kitsu.io/anime/', ''),
        });
      }
    },
  );

  return {
    livechart: res[bestMatch.bestMatchIndex].id,
    ext_sources,
  };
};

(async () => {
  const tvdb = await getMappingsLiveChart(
    'Youkoso Jitsuryoku Shijou Shugi no Kyoushitsu e',
  );
  console.log(tvdb.ext_sources.anime_planet[0]);
  // console.log(
  //   stringsim.findBestMatch('One Piece', ['One Piece', String(undefined)]),
  // );
})();
