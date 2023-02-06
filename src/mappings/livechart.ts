import axios from 'axios';
import { load } from 'cheerio';

import stringsim from 'string-similarity';

const livechart = async (title: string) => {
  const res: any[] = [];
  const ext_sources: any = {
    anilist: [],
    myanimelist: [],
    anidb: [],
    anime_planet: [],
    anisearch: [],
    kitsu: [],
  };

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
  if (res.length == 0) {
    return {
      livechart: null,
    //  ext_sources,
    };
  }
  const bestMatch = stringsim.findBestMatch(
    title,
    res.map((d) => d.title),
  );
  // console.log(res);

/*  const { data: liveChartApi } = await axios.get(
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
*/

  //avoid ratelimit
//  await new Promise(r => setTimeout(r, 100));

  return {
    livechart: res[bestMatch.bestMatchIndex].id,
  //  ext_sources,
  };
};

export default livechart;
