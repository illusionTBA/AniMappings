import { ANIME } from '@consumet/extensions';
import axios from 'axios';
import stringsim from 'string-similarity';
import chalk from 'chalk';
const zoro = async (title: string) => {
  const zoro = new ANIME.Zoro();
  console.log(chalk.yellow`[!] Checking zoro for ${title}`);
  return await zoro
    .search(title)
    .then((resp: any) => {
      const bestMatch = stringsim.findBestMatch(
        title.toLowerCase(),
        resp.results.map((item: any) => (item.title as string).toLowerCase()),
      );
      console.log(chalk.green`Got Mappings for ${title} via Zoro`);
      return resp.results[bestMatch.bestMatchIndex].id;
    })
    .catch(() => {
      console.error(
        `An error occurred while getting zoro mappings for ${title}`,
      );
      return undefined;
    });
};

export default zoro;
