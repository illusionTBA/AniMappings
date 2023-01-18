import axios from 'axios';

import stringsim from 'string-similarity';

const thetvdb = async (title: string, year?: string) => {
  console.log(`[+] Getting TVDB mappings for ${title} ${year}`);
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
      String(title),
      await tvdbData.results[0].hits.map((d: any) => {
        const title = String(
          d.translations.por ?? d.translations.eng ?? d.name,
        );
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
    return tvdbData.results[0].hits[bestMatch.bestMatchIndex];
  } catch (error) {
    console.log(`[!] Failed to get TVDB mappings for ${title} `);
    // console.error(error);
    return {
      message: 'An error occurred while getting tvdb mappings',
    };
  }
};

export default thetvdb;
