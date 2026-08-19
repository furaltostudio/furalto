import { NextRequest, NextResponse } from "next/server";
import { parseGeocodeResult } from "@/lib/google/parseAddress";

export async function GET(request: NextRequest) {
  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Maps API key is not configured." },
      { status: 500 }
    );
  }

  const lat = request.nextUrl.searchParams.get("lat");
  const lng = request.nextUrl.searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "Latitude and longitude are required." }, { status: 400 });
  }

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("latlng", `${lat},${lng}`);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("language", "en");
  url.searchParams.set("result_type", "street_address|route|premise|subpremise|neighborhood");

  const response = await fetch(url.toString(), { next: { revalidate: 0 } });
  const data = (await response.json()) as {
    status: string;
    results?: Array<{
      formatted_address?: string;
      address_components?: Array<{
        long_name: string;
        short_name: string;
        types: string[];
      }>;
    }>;
    error_message?: string;
  };

  if (data.status !== "OK" || !data.results?.length) {
    return NextResponse.json(
      {
        error:
          data.error_message ??
          "Could not detect address for your location. Try typing your address manually.",
      },
      { status: 404 }
    );
  }

  const address = parseGeocodeResult(data.results[0]);

  return NextResponse.json({ address });
}
