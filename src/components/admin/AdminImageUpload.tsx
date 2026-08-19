"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { getAuthErrorMessage } from "@/providers/AuthProvider";
import { adminService } from "@/services/admin.service";

type AdminImageUploadProps = {
  label?: string;
  value: string;
  alt: string;
  folder?: string;
  onChange: (value: { src: string; alt: string; width: number; height: number }) => void;
};

export function AdminImageUpload({
  label = "Product image",
  value,
  alt,
  folder = "furalto/products",
  onChange,
}: AdminImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const asset = await adminService.uploadImage(file, folder);
      onChange({
        src: asset.url,
        alt: alt || file.name,
        width: asset.width,
        height: asset.height,
      });
    } catch (uploadError) {
      setError(getAuthErrorMessage(uploadError));
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="admin-image-upload">
      <span className="admin-label">{label}</span>

      <div className="admin-image-upload-panel">
        <div className="admin-image-upload-preview">
          {value ? (
            <Image src={value} alt={alt || "Uploaded product image"} fill sizes="240px" className="admin-product-card-image" />
          ) : (
            <div className="admin-product-card-placeholder">No image uploaded</div>
          )}
        </div>

        <div className="admin-image-upload-actions">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />
          <button
            type="button"
            className="admin-button admin-button-primary"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            <Upload size={16} />
            {isUploading ? "Uploading..." : value ? "Replace image" : "Upload image"}
          </button>
          <p className="admin-muted">JPG, PNG, or WebP up to 8MB. Stored on Cloudinary.</p>
          {value ? <p className="admin-image-upload-url">{value}</p> : null}
        </div>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}
    </div>
  );
}
