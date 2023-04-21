import axios from 'axios';
import * as stringsim from 'string-similarity';

const kitsu = async (title: string) => {

  try {
    console.log(`[+] Getting Kitsu mappings for ${title}`);
    const { data: kData } = await axios.get(
      `https://kitsu.io/api/edge/anime?filter[text]=${title}`,
    );
    const bestMatch = stringsim.findBestMatch(
      String(title),
      kData.data.map(
        (d: any) => d.attributes.titles.en_jp ?? d.attributes.titles.en ?? '',
      ),
    );
    // console.log(bestMatch);
    // console.log(kData.data[bestMatch.bestMatchIndex].id);

    return kData.data[bestMatch.bestMatchIndex];
  } catch (error) {
    // console.error(error);
    console.log(`[-] Failed to get mappings for ${title} on Kitsu`);
    return undefined;
  }
};

export default kitsu;
