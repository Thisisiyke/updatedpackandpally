/** Parsed place result aligned with Wanderly mobile `GooglePlaceSearch` / trip create body. */
export type ResolvedPlace = {
  placeId: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
  zipCode: string;
};

type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

/** Extract city/country/state/postal from Places `address_components` (same logic as Wanderly RN). */
export function parseAddressComponents(
  components: AddressComponent[] | undefined
): Pick<ResolvedPlace, "city" | "state" | "country" | "zipCode"> {
  let city = "";
  let state = "";
  let country = "";
  let zipCode = "";

  if (!Array.isArray(components)) {
    return { city, state, country, zipCode };
  }

  for (const component of components) {
    const types = component.types || [];
    if (types.includes("locality")) {
      city = component.long_name;
    }
    if (types.includes("administrative_area_level_1")) {
      state = component.long_name;
    }
    if (types.includes("country")) {
      country = component.long_name;
    }
    if (types.includes("postal_code")) {
      zipCode = component.long_name;
    }
  }

  if (!city) {
    for (const component of components) {
      const types = component.types || [];
      if (
        types.includes("postal_town") ||
        types.includes("administrative_area_level_2") ||
        types.includes("sublocality") ||
        types.includes("sublocality_level_1")
      ) {
        city = component.long_name;
        break;
      }
    }
  }

  return { city, state, country, zipCode };
}
