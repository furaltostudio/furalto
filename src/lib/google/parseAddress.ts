export type ParsedAddress = {
  address: string;
  city: string;
  state: string;
  postalCode: string;
};

type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

function getComponent(components: AddressComponent[], type: string): string {
  return components.find((component) => component.types.includes(type))?.long_name ?? "";
}

export function parseAddressComponents(components: AddressComponent[]): ParsedAddress {
  const streetNumber = getComponent(components, "street_number");
  const route = getComponent(components, "route");
  const sublocality =
    getComponent(components, "sublocality_level_1") ||
    getComponent(components, "sublocality") ||
    getComponent(components, "neighborhood");
  const city =
    getComponent(components, "locality") ||
    getComponent(components, "administrative_area_level_2") ||
    sublocality;
  const state = getComponent(components, "administrative_area_level_1");
  const postalCode = getComponent(components, "postal_code");

  const streetLine = [streetNumber, route].filter(Boolean).join(" ").trim();
  const address = streetLine || sublocality;

  return {
    address,
    city,
    state,
    postalCode,
  };
}

export function parseGeocodeResult(result: {
  formatted_address?: string;
  address_components?: AddressComponent[];
}): ParsedAddress {
  const components = result.address_components ?? [];
  const parsed = parseAddressComponents(components);

  if (!parsed.address && result.formatted_address) {
    parsed.address = result.formatted_address.split(",")[0]?.trim() ?? "";
  }

  return parsed;
}
