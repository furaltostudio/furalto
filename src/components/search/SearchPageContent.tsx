"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { PageHeroWithImage } from "@/components/shared/PageHeroWithImage";
import { categoryImages } from "@/config/images";
import { catalogService } from "@/services/catalog.service";
import { POPULAR_SEARCHES } from "@/lib/products/search";
import { Reveal } from "@/components/ui/Reveal";
import type { Product } from "@/types/product";

export function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const term = initialQuery.trim();
    if (!term) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    catalogService
      .search(term, 60)
      .then((response) => {
        if (!cancelled) {
          setResults(response.data.products || []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResults([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsSearching(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [initialQuery]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <>
      <PageHeroWithImage
        eyebrow="Search"
        title="Find Your Piece"
        description="Search collections, products, and categories across the Furalto catalog."
        image={categoryImages.decor}
        className="utility-hero"
      />

      <section className="search-page">
        <div className="container-app utility-page-inner">
          <Reveal className="search-panel">
            <p className="utility-panel-eyebrow">Catalog Search</p>
            <h2>Search Products</h2>
            <p className="utility-panel-lead">
              Discover sofas, beds, lighting, and decor across every Furalto collection.
            </p>

            <form className="search-page-form" onSubmit={handleSubmit}>
              <div className="search-page-input-wrap">
                <Search className="search-page-input-icon" strokeWidth={1.5} aria-hidden="true" />
                <input
                  type="search"
                  name="q"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search sofas, beds, lighting..."
                  aria-label="Search products"
                />
              </div>
              <button type="submit" className="utility-form-submit">
                Search
              </button>
            </form>

            {initialQuery.trim() ? (
              <div className="search-results">
                <p className="search-results-count">
                  {isSearching
                    ? "Searching..."
                    : `${results.length} result${results.length === 1 ? "" : "s"} for "${initialQuery}"`}
                </p>
                {results.length > 0 ? (
                  <div className="product-grid">
                    {results.map((product) => (
                      <ProductCard key={product.slug} product={product} />
                    ))}
                  </div>
                ) : !isSearching ? (
                  <div className="search-empty">
                    <p>No products matched your search.</p>
                    <Link href="/collections">Browse all collections</Link>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="search-suggestions">
                <p>Popular searches</p>
                <div className="search-suggestion-links">
                  {POPULAR_SEARCHES.map((item) => (
                    <Link key={item.query} href={item.href}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}
