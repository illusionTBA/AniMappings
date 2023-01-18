import axios from 'axios';
import stringsim from 'string-similarity';

const tmdb = async (tvdbId: any) => {
  try {
    const { data: tmdb } = await axios.get(
      `https://api.themoviedb.org/3/find/${tvdbId}?api_key=5201b54eb0968700e693a30576d7d4dc&external_source=tvdb_id`,
    );

    return tmdb;
  } catch (error) {
    console.error(
      `An error occurred while getting tmdb mappings for ${tvdbId}`,
    );
    return {
      message: `An error occurred while getting tmdb mappings for ${tvdbId}`,
    };
  }
};

export default tmdb;
