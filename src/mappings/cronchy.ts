import axios from 'axios';
import stringsim from 'string-similarity';

/**
 * @Deprecated Api has shutdown
 */
const cronchy = async (title: string) => {
  try {
    const { data: crunchy } = await axios.get(
      `https://cronchy.consumet.stream/search/${title}`,
    );

    const bestMatch = stringsim.findBestMatch(
      title.toLowerCase(),
      crunchy.results.map((item: any) => (item.title as string).toLowerCase()),
    );
    // console.log(bestMatch);
    // console.log(crunchy.results[bestMatch.bestMatchIndex]);
    return crunchy.results[bestMatch.bestMatchIndex];
  } catch (error) {
    console.error(
      `An error occurred while getting crunchyroll mappings for ${title}`,
    );
    return undefined;
  }
};

export default cronchy;
