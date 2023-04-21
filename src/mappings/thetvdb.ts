import axios from 'axios';
import { load } from 'cheerio';

import stringsim from 'string-similarity';
import chalk from 'chalk';

const thetvdb = async (title: string, year?: string, format?: string) => {
  // console.log('format', format);
  if (format === undefined) format == 'TV';
  console.log(
    chalk.green(`[+] Getting TVDB mappings for ${title} ${year} ${format}`),
  );
  // if the title includes the words "season", "cour" or part remove it
  title = title.replace(/(season|cour|part)/gi, '').trim();
  // console.log(tvdbData.results[tvdbData.results.length - 1].hits[0]);
  try {
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
    if (tvdbData.results[0].hits.length === 0) {
      return undefined;
    }
    const bestMatch = stringsim.findBestMatch(
      String(title).toLowerCase().trim(),
      await tvdbData.results[0].hits.map((d: any) => {
        const title = String(
          d.translations.por ?? d.translations.eng ?? d.name,
        ).toLowerCase();
        if (d.type === 'movies' || d.type === 'series') {
          if (year === undefined) {
            return title;
          }
          // console.log('Checking ' + title + ' with the year ' + year);
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

    const artworks = {
      backgrounds: [] as string[],
      banners: [] as string[],
      clearArt: [] as string[],
      clearLogo: [] as string[],
      icons: [] as string[],
      posters: [] as string[],
    };
    const { data: artworkData } = await axios.get(
      `https://thetvdb.com/dereferrer/${
        format === 'TV' ? 'series' : format === 'TV_SHORT' ? 'series' : 'movie'
      }/${tvdbData.results[0].hits[bestMatch.bestMatchIndex].id}`,
    );

    const $$ = load(artworkData);

    // backgrounds
    $$(
      'div.tab-content > div#artwork > div.tab-content > div#artwork-backgrounds > div.simple-grid > div',
    ).each((_, el) => {
      artworks.backgrounds.push(
        $$(el).find('a > img').attr('data-src') as string,
      );
    });

    // Banners
    $$(
      'div.tab-content > div#artwork > div.tab-content > div#artwork-banners > div.simple-grid > div',
    ).each((_, el) => {
      artworks.banners.push($$(el).find('a > img').attr('data-src') as string);
    });
    // Clear Art
    $$(
      'div.tab-content > div#artwork > div.tab-content > div#artwork-clearart > div.simple-grid > div',
    ).each((_, el) => {
      artworks.clearArt.push($$(el).find('a > img').attr('data-src') as string);
    });
    // Clear Logo
    $$(
      'div.tab-content > div#artwork > div.tab-content > div#artwork-clearlogo > div.simple-grid > div',
    ).each((_, el) => {
      artworks.clearLogo.push(
        $$(el).find('a > img').attr('data-src') as string,
      );
    });
    // Icons
    $$(
      'div.tab-content > div#artwork > div.tab-content > div#artwork-icons > div.simple-grid > div',
    ).each((_, el) => {
      artworks.icons.push($$(el).find('a > img').attr('data-src') as string);
    });
    // Posters
    $$(
      'div.tab-content > div#artwork > div.tab-content > div#artwork-posters > div.simple-grid > div',
    ).each((_, el) => {
      artworks.posters.push($$(el).find('a > img').attr('data-src') as string);
    });

    return {
      ...tvdbData.results[0].hits[bestMatch.bestMatchIndex],
      artworks: artworks,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(`[!] Failed to get TVDB mappings for ${title} - ${error.message}`);
    } else {
          console.log(`[!] Failed to get TVDB mappings for ${title}`);
    }
    // console.error(error);
    return undefined;
  }
};

export default thetvdb;

// (async () => {
//   const tvdb = await thetvdb('A Silent Voice', '2016');
//   console.log(tvdb);
// })();
