import axios, { type AxiosInstance } from "axios";

const DEFAULT_BASE_URL = "https://vg.g210512.com/api/v1";

type CreateClientOptions = {
        baseURL?: string;
};

const createClient = ({ baseURL = DEFAULT_BASE_URL }: CreateClientOptions = {}): AxiosInstance => {
        const apiKey = process.env.INMUEBLES_API_KEY;

        return axios.create({
                baseURL,
                headers: {
                        Accept: "application/json",
                        ...(apiKey ? { "X-Api-Key": apiKey } : {}),
                },
        });
};

let cachedClient: AxiosInstance | null = null;

export const getInmueblesApiClient = (): AxiosInstance => {
        if (!cachedClient) {
                cachedClient = createClient({ baseURL: process.env.INMUEBLES_API_BASE_URL });
        }

        return cachedClient;
};

export default getInmueblesApiClient;
