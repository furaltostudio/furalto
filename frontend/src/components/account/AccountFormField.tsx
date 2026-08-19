"use client";

import { useId, useState } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";

type AccountFormFieldProps = {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  icon?: LucideIcon;
  hint?: string;
};

export function AccountFormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  minLength,
  autoComplete,
  icon: Icon,
  hint,
}: AccountFormFieldProps) {
  const toggleId = useId();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <label className="account-field">
      <span className="account-field-label">{label}</span>
      <div className="account-field-control">
        {Icon ? (
          <span className="account-field-icon" aria-hidden="true">
            <Icon strokeWidth={1.5} />
          </span>
        ) : null}
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          className={[
            Icon ? "account-field-input-with-icon" : "",
            isPassword ? "account-field-input-with-toggle" : "",
          ]
            .filter(Boolean)
            .join(" ") || undefined}
        />
        {isPassword ? (
          <button
            id={toggleId}
            type="button"
            className="account-field-toggle"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setShowPassword((current) => !current);
            }}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff strokeWidth={1.5} /> : <Eye strokeWidth={1.5} />}
          </button>
        ) : null}
      </div>
      {hint ? <span className="account-field-hint">{hint}</span> : null}
    </label>
  );
}

export function AccountFormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="account-form-section">
      <p className="account-form-section-title">{title}</p>
      <div className="account-form-section-body">{children}</div>
    </div>
  );
}
