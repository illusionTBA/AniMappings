import axios from 'axios'
const fribbList = async(malId: number) => {
	try {
	const {data} = await axios.get("https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-full.json")

	return data.find((d: any) => d.mal_id == malId) ?? undefined
	} catch(err) {
		console.log(err)
		return {
			"livechart_id": null,
    			"thetvdb_id": null,
    			"anime-planet_id": null,
    			"anisearch_id": null,
    			"anidb_id": null,
    			"kitsu_id": null,
    			"mal_id": null,
   			 "type": null,
    			"notify.moe_id": null,
    			"anilist_id": null
		}
	}
}

export default fribbList;




//(async() => {
//	console.log(await fribbList(49487))
//})()
