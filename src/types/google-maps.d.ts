type GoogleAddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type GooglePlaceResult = {
  formatted_address?: string;
  address_components?: GoogleAddressComponent[];
};

type GoogleAutocomplete = {
  addListener: (eventName: string, handler: () => void) => void;
  getPlace: () => GooglePlaceResult;
};

type GoogleMapsPlaces = {
  Autocomplete: new (
    inputField: HTMLInputElement,
    opts?: {
      componentRestrictions?: { country: string | string[] };
      fields?: string[];
      types?: string[];
    }
  ) => GoogleAutocomplete;
};

type GoogleMapsApi = {
  places: GoogleMapsPlaces;
  event: {
    clearInstanceListeners: (instance: object) => void;
  };
};

declare global {
  interface Window {
    google?: {
      maps?: GoogleMapsApi;
      accounts?: {
        id?: import("@/types/google-auth").GoogleAccountsId;
      };
    };
  }
}

export type { GoogleAddressComponent, GoogleAutocomplete, GooglePlaceResult };
