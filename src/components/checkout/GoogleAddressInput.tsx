"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMapsPlaces } from "@/lib/google/loadGoogleMaps";
import { parseGeocodeResult, type ParsedAddress } from "@/lib/google/parseAddress";
import type { GoogleAutocomplete } from "@/types/google-maps";

type GoogleAddressInputProps = {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected: (address: ParsedAddress) => void;
  placeholder?: string;
};

export function GoogleAddressInput({
  value,
  onChange,
  onPlaceSelected,
  placeholder,
}: GoogleAddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const onPlaceSelectedRef = useRef(onPlaceSelected);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
    onPlaceSelectedRef.current = onPlaceSelected;
  });

  useEffect(() => {
    let autocomplete: GoogleAutocomplete | null = null;
    let cancelled = false;

    loadGoogleMapsPlaces()
      .then(() => {
        if (cancelled || !inputRef.current || !window.google?.maps?.places) {
          return;
        }

        autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: "in" },
          fields: ["address_components", "formatted_address"],
          types: ["address"],
        });

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete?.getPlace();
          if (!place) {
            return;
          }

          const parsed = parseGeocodeResult({
            formatted_address: place.formatted_address,
            address_components: place.address_components,
          });

          onChangeRef.current(parsed.address || place.formatted_address || "");
          onPlaceSelectedRef.current(parsed);
        });

        setIsReady(true);
      })
      .catch(() => {
        setIsReady(false);
      });

    return () => {
      cancelled = true;
      if (autocomplete) {
        window.google?.maps?.event?.clearInstanceListeners(autocomplete);
      }
    };
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      name="address"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required
      placeholder={placeholder}
      autoComplete={isReady ? "off" : "shipping address-line1"}
    />
  );
}
