import axios from "axios";
import { DateTime } from "luxon";
import { parse } from "node-html-parser";

export enum SearchParams {
	query = "q",
	category = "c",
	filter = "f",
	sort = "s",
	order = "o",
	page = "[",
}

export type Season = "spring" | "summer" | "autumn" | "winter";

interface Anime {
	title: string;
	link: string;
	date: number;
	episodeCount?: number;
	episodeDuration?: number;
	genres: string[];
	image: string;
	synopsis: string;
	studios: Studio[];
	score?: number;
	members: number;
}

interface Studio {
	name: string;
	href: string;
}

class MalKa {
	private readonly MAL_URL = "https://myanimelist.net/";

	public async getSeason(): Promise<Anime[]>;
	public async getSeason(year: number, season: Season): Promise<Anime[]>;
	public async getSeason(year?: number, season?: Season): Promise<Anime[]> {
		const url = new URL(`/anime/season${year !== undefined ? `/${year}/${season}` : ""}`, this.MAL_URL);

		const response = await axios.get(url.href);
		const document = parse(response.data);

		const animeItems = document.querySelectorAll(".js-seasonal-anime");

		const anime = animeItems.map((animeItem) => {
			const titleLink = animeItem.querySelector("h2 a");
			const producerInfo = animeItem.querySelector(".prodsrc .info");
			const [dateElement, episodesElement] = producerInfo.querySelectorAll(".item");
			const imageElement = animeItem.querySelector("img");

			const title = titleLink.text;
			const link = titleLink.getAttribute("href");
			const date = DateTime.fromFormat(dateElement.text.trim(), "MMM dd, yyyy");
			const [episodeCount, episodeDuration] = episodesElement
				.querySelectorAll("span")
				.map((element) => Number.parseInt(element.text.split(" ")[0]) || undefined);
			const genres = animeItem.querySelectorAll(".genre a").map((genreElement) => genreElement.getAttribute("title"));
			const image = imageElement.getAttribute("src") || imageElement.getAttribute("data-src");
			const synopsis = animeItem.querySelector(".synopsis .preline").text.trim();
			const studios = animeItem
				.querySelectorAll(".synopsis .properties .property")[0]
				.querySelectorAll(".item a")
				.map((studio) => {
					return { name: studio.getAttribute("title"), href: studio.getAttribute("href") };
				});
			const score = Number.parseFloat(animeItem.querySelector(".score").text.trim()) || undefined;
			const members = Number.parseInt(animeItem.querySelector(".member").text.trim());

			return {
				title,
				link,
				date: date.toMillis() || undefined,
				episodeCount,
				episodeDuration,
				genres,
				image,
				synopsis,
				studios,
				score,
				members,
			};
		});

		return anime;
	}
}

export default new MalKa();
