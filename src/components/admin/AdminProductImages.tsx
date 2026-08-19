"use client";

import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  ImagePlus,
  Plus,
  Ruler,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { getAuthErrorMessage } from "@/providers/AuthProvider";
import { adminService } from "@/services/admin.service";

export type ProductImageDraft = {
  src: string;
  alt: string;
  width: number;
  height: number;
  hidden?: boolean;
};

type AdminProductImagesProps = {
  images: ProductImageDraft[];
  productName: string;
  folder?: string;
  scaleImageIndex?: number | null;
  onChange: (images: ProductImageDraft[]) => void;
  onScaleImageIndexChange?: (index: number | null) => void;
};

function remapScaleIndex(
  scaleIndex: number | null | undefined,
  from: number,
  to: number,
  length: number
): number | null {
  if (scaleIndex == null || scaleIndex < 0) return scaleIndex ?? null;
  if (from === to) return scaleIndex;
  if (scaleIndex === from) return to;
  if (from < to && scaleIndex > from && scaleIndex <= to) return scaleIndex - 1;
  if (from > to && scaleIndex >= to && scaleIndex < from) return scaleIndex + 1;
  if (scaleIndex >= length) return Math.max(0, length - 1);
  return scaleIndex;
}

export function AdminProductImages({
  images,
  productName,
  folder = "furalto/products",
  scaleImageIndex = null,
  onChange,
  onScaleImageIndexChange,
}: AdminProductImagesProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const replaceIndexRef = useRef<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const setScaleIndex = (index: number | null) => {
    onScaleImageIndexChange?.(index);
  };

  const updateAt = (index: number, patch: Partial<ProductImageDraft>) => {
    onChange(images.map((image, i) => (i === index ? { ...image, ...patch } : image)));
  };

  const removeAt = (index: number) => {
    const next = images.filter((_, i) => i !== index);
    onChange(next);
    if (scaleImageIndex == null) return;
    if (scaleImageIndex === index) {
      setScaleIndex(next.length ? Math.min(index, next.length - 1) : null);
    } else if (scaleImageIndex > index) {
      setScaleIndex(scaleImageIndex - 1);
    }
  };

  const move = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= images.length) {
      return;
    }

    const next = [...images];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    onChange(next);
    setScaleIndex(remapScaleIndex(scaleImageIndex, index, nextIndex, next.length));
  };

  const makePrimary = (index: number) => {
    if (index === 0) {
      return;
    }
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    onChange(next);
    setScaleIndex(remapScaleIndex(scaleImageIndex, index, 0, next.length));
  };

  const makeScaleImage = (index: number) => {
    setScaleIndex(index);
  };

  const uploadFiles = async (files: FileList | File[], replaceIndex: number | null) => {
    const list = Array.from(files);
    if (list.length === 0) {
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const uploaded: ProductImageDraft[] = [];

      for (const file of list) {
        const asset = await adminService.uploadImage(file, folder);
        uploaded.push({
          src: asset.url,
          alt: productName || file.name.replace(/\.[^.]+$/, ""),
          width: asset.width || 1200,
          height: asset.height || 1500,
        });
      }

      if (replaceIndex !== null && uploaded[0]) {
        const next = [...images];
        next[replaceIndex] = {
          ...uploaded[0],
          alt: images[replaceIndex]?.alt || uploaded[0].alt,
          hidden: images[replaceIndex]?.hidden || false,
        };
        onChange([...next, ...uploaded.slice(1)]);
      } else {
        onChange([...images, ...uploaded.map((image) => ({ ...image, hidden: false }))]);
      }
    } catch (uploadError) {
      setError(getAuthErrorMessage(uploadError));
    } finally {
      setIsUploading(false);
      replaceIndexRef.current = null;
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) {
      return;
    }

    await uploadFiles(files, replaceIndexRef.current);
    event.target.value = "";
  };

  const openPicker = (replaceIndex: number | null = null) => {
    replaceIndexRef.current = replaceIndex;
    inputRef.current?.click();
  };

  const countLabel =
    images.length === 0
      ? "No photos yet"
      : images.length === 1
        ? "1 photo"
        : `${images.length} photos`;

  return (
    <div className={`admin-gallery${isUploading ? " is-uploading" : ""}`}>
      <div className="admin-gallery-header">
        <div className="admin-gallery-copy">
          <div className="admin-gallery-title-row">
            <span className="admin-label">Product images</span>
            <span className="admin-gallery-count">{countLabel}</span>
          </div>
          <p className="admin-gallery-hint">
            First image is primary. Hide photos to keep them in admin without showing on the site.
            Use the ruler to pick the Size guide photo.
          </p>
        </div>
        <button
          type="button"
          className="admin-button admin-button-primary"
          disabled={isUploading}
          onClick={() => openPicker(null)}
        >
          <Plus size={15} />
          {isUploading ? "Uploading..." : "Add images"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={handleFileChange}
      />

      {images.length === 0 ? (
        <button
          type="button"
          className="admin-gallery-empty"
          disabled={isUploading}
          onClick={() => openPicker(null)}
        >
          <span className="admin-gallery-empty-icon">
            <ImagePlus size={22} />
          </span>
          <span className="admin-gallery-empty-title">Add gallery images</span>
          <span className="admin-gallery-empty-copy">
            JPG, PNG, or WebP · up to 8MB · stored on Cloudinary
          </span>
        </button>
      ) : (
        <ul className="admin-gallery-list">
          {images.map((image, index) => {
            const isPrimary = index === 0;
            const isScale = scaleImageIndex === index;
            const isHidden = Boolean(image.hidden);
            return (
              <li
                key={`${image.src}-${index}`}
                className={`admin-gallery-item${isPrimary ? " is-primary" : ""}${
                  isScale ? " is-scale" : ""
                }${isHidden ? " is-hidden" : ""}`}
              >
                <div className="admin-gallery-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.src} alt={image.alt || `Product image ${index + 1}`} />
                  <span className="admin-gallery-index">{index + 1}</span>
                  {isPrimary ? <span className="admin-gallery-primary-tag">Primary</span> : null}
                  {isScale ? <span className="admin-gallery-scale-tag">Size</span> : null}
                  {isHidden ? <span className="admin-gallery-hidden-tag">Hidden</span> : null}
                </div>

                <div className="admin-gallery-body">
                  <div className="admin-gallery-body-top">
                    <p className="admin-gallery-item-label">
                      {isHidden
                        ? `Hidden · photo ${index + 1}`
                        : isPrimary && isScale
                          ? "Primary · Size guide"
                          : isPrimary
                            ? "Primary photo"
                            : isScale
                              ? `Size guide · photo ${index + 1}`
                              : `Gallery photo ${index + 1}`}
                    </p>
                    <div className="admin-gallery-toolbar">
                      <button
                        type="button"
                        className="admin-gallery-icon-btn"
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                        title="Move left"
                        aria-label="Move image earlier"
                      >
                        <ArrowLeft size={14} />
                      </button>
                      <button
                        type="button"
                        className="admin-gallery-icon-btn"
                        disabled={index === images.length - 1}
                        onClick={() => move(index, 1)}
                        title="Move right"
                        aria-label="Move image later"
                      >
                        <ArrowRight size={14} />
                      </button>
                      <button
                        type="button"
                        className="admin-gallery-icon-btn"
                        disabled={isPrimary}
                        onClick={() => makePrimary(index)}
                        title="Make primary"
                        aria-label="Make this the primary image"
                      >
                        <Star size={14} fill={isPrimary ? "currentColor" : "none"} />
                      </button>
                      <button
                        type="button"
                        className={`admin-gallery-icon-btn${isScale ? " is-active" : ""}`}
                        onClick={() => makeScaleImage(index)}
                        title="Use for Size guide"
                        aria-label="Use this image for the Size guide"
                      >
                        <Ruler size={14} />
                      </button>
                      <button
                        type="button"
                        className={`admin-gallery-icon-btn${isHidden ? " is-active" : ""}`}
                        onClick={() => updateAt(index, { hidden: !isHidden })}
                        title={isHidden ? "Show on website" : "Hide from website"}
                        aria-label={
                          isHidden
                            ? `Show image ${index + 1} on website`
                            : `Hide image ${index + 1} from website`
                        }
                        aria-pressed={isHidden}
                      >
                        {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        type="button"
                        className="admin-gallery-icon-btn"
                        disabled={isUploading}
                        onClick={() => openPicker(index)}
                        title="Replace image"
                        aria-label={`Replace image ${index + 1}`}
                      >
                        <Upload size={14} />
                      </button>
                      <button
                        type="button"
                        className="admin-gallery-icon-btn is-danger"
                        onClick={() => removeAt(index)}
                        title="Remove image"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <label className="admin-gallery-alt">
                    <span>Alt text</span>
                    <input
                      value={image.alt}
                      onChange={(event) => updateAt(index, { alt: event.target.value })}
                      placeholder={productName || `Image ${index + 1}`}
                    />
                  </label>
                </div>
              </li>
            );
          })}

          <li>
            <button
              type="button"
              className="admin-gallery-add-tile"
              disabled={isUploading}
              onClick={() => openPicker(null)}
            >
              <Plus size={18} />
              <span>Add more</span>
            </button>
          </li>
        </ul>
      )}

      {error ? <p className="admin-error">{error}</p> : null}
    </div>
  );
}
