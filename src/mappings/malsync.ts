import axios from 'axios';
import chalk from 'chalk';
const Malsync = async (malId: number) => {
  try {
    const { data } = await axios.get(
      `https://api.malsync.moe/mal/anime/${malId}`,
    );
    console.log(`[+] Getting Mappings for ${malId}`);
    return data.Sites;
  } catch (error) {
    console.log(
      chalk.red('Failed to get mappings for ') +
        chalk.redBright('MalSync ') +
        chalk.red(`for ID ${malId}`),
    );
    return null;
  }
};

export default Malsync;

// (async () => {
//   const malsync = await Malsync(40748);
//   console.log(Object.values(malsync.Zoro)[0]);
// })();
