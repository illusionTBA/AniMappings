import { ANIME } from '@consumet/extensions';
import stringsim from 'string-similarity';

const gogo = async (title: string) => {
  const gogo = new ANIME.Gogoanime();

  return await gogo
    .search(title)
    .then((resp: any) => {
      const bestMatch = stringsim.findBestMatch(
        title.toLowerCase(),
        resp.results.map((item: any) => (item.title as string).toLowerCase()),
      );
      console.log(resp.results[bestMatch.bestMatchIndex].id);
      return resp.results[bestMatch.bestMatchIndex].id;
    })
    .catch(() => {
      console.error(
        `An error occurred while getting gogoanime mappings for ${title}`,
      );
      return null;
    });
};

export default gogo;
