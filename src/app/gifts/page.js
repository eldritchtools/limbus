import GiftsPage from "./GiftsPage";
import { fetchData } from "../components/DataFetcherServer";

export default async function Page() {
    const gifts = await fetchData("gifts");
    const minifiedGifts = Object.entries(gifts).map(([id, gift]) => {
        const {names, srcPath, keyword, tier} = gift;
        return [id, {id, names: names.slice(0, 1), srcPath, keyword, tier}];
    })

    return <GiftsPage initGifts={minifiedGifts} />
}
