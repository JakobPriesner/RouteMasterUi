export interface PlaceSearchResult {
    placeId: string;
    formattedAddress: string;
}

export interface PlaceDetailsResult {
    formattedAddress: string;
    location: PlaceDetailLocationResult;
    addressComponents: DetailsAddressComponent[];
}

export interface PlaceDetailLocationResult {
    latitude: number;
    longitude: number;
}

export interface DetailsAddressComponent {
    longText: string;
    shortText: string;
    types: string[];
    languageCode: string;
}

export interface PlacePredictionResponse {
    suggestions: Suggestion[];
}

export interface Suggestion {
    placePrediction: {
        place: string;
        placeId: string;
        text: {
            text: string;
            matches: string[];
        };
        structuredFormat: {
            mainText: {
                text: string;
                matches: string[];
            };
            secondaryText: string;
        };
        types: string[];
    };
}
