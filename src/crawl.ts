import axios from "axios";
import { getMappings } from "./getMappings";
(async() => {
    const { data } = await axios.get("https://raw.githubusercontent.com/5H4D0WILA/IDFetch/main/ids.txt")
    const ids = data.split('\n')

    
    for (let i = 0; i < ids.length; i++) {
        // stop if we reached the end of the list
        if (i >= ids.length) {
            break;
        }
        
        try {
            console.time('mappings')
            const mappings = await getMappings(ids[i])
            console.timeEnd('mappings')
            console.log(`[?] ${i + 1}/${ids.length}`)
        } catch (error: unknown) {
            if (error instanceof Error) {
                 console.log(`[!] Failed to get mappings for ${ids[i]} - ${error.message}`)
            }
        }
    }
})()