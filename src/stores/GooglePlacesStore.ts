import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import {
    PlaceSearchResult,
    PlaceDetailsResult,
    PlacePredictionResponse,
} from "../types/GooglePlacesTypes";
import {useNotifications} from "@toolpad/core/useNotifications";

export class GooglePlacesStore {
    private client: AxiosInstance;

    private _sessionToken: string;

    private readonly baseUrl = "https://places.googleapis.com/v1/places";

    private cache: {} = {}

    constructor() {
        this._sessionToken = crypto.randomUUID();
        this.client = axios.create({
            baseURL: this.baseUrl,
            timeout: 5000,
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": import.meta.env.VITE_GOOGLE_PLACES_API_KEY,
            },
        });
    }

    public async searchPlaces(
        query: string,
        signal: AbortSignal | null = null
    ): Promise<PlaceSearchResult[]> {
        if (!query || query.length < 4) {
            return [];
        }

        if (query in this.cache) {
            return this.cache[query];
        }

        const requestPayload = {
            input: query,
            languageCode: "de-DE",
            regionCode: "de",
            sessionToken: this._sessionToken,
        };

        const config: AxiosRequestConfig = {};
        if (signal) {
            config.signal = signal;
        }

        try {
            const result = await this.client.post(":autocomplete", requestPayload, config);
            const content = result.data as PlacePredictionResponse;
            if (!content.suggestions || content.suggestions.length === 0) {
                return [];
            }

            const suggestions = content.suggestions.map<PlaceSearchResult>((suggestion) => ({
                placeId: suggestion.placePrediction.placeId,
                formattedAddress: suggestion.placePrediction.text.text,
            }));

            this.cache[query] = suggestions;

            return suggestions;
        } catch (error: any) {
            const notifications = useNotifications();
            notifications.show("Error while searching places.", {
                severity: "error",
                autoHideDuration: 3000,
            });
        } finally {
        }
    }

    public async getPlaceDetails(
        placeId: string,
        signal: AbortSignal | null = null
    ): Promise<PlaceDetailsResult | undefined> {
        const config: AxiosRequestConfig = {
            headers: {
                "X-Goog-FieldMask": "location,formattedAddress,addressComponents",
            },
        };
        if (signal) {
            config.signal = signal;
        }
        try {
            const result = await this.client.get(`/${placeId}?sessionToken=${this._sessionToken}`, config);
            this._sessionToken = crypto.randomUUID();
            return result.data as PlaceDetailsResult;
        } catch (error: any) {
            const notifications = useNotifications();
            notifications.show("Error while searching places.", {
                severity: "error",
                autoHideDuration: 3000,
            });
        }
    }
}

export const googlePlacesStore = new GooglePlacesStore();
