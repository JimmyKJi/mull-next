"use client";

// DemographicsForm — the optional "general info" picker (age, gender,
// cultural background, education, religion). Rendered in two places:
//
//   variant="gate"  — a skippable card shown once, right after a logged-in
//                     user opts IN at the research-consent gate. Has
//                     "Save & continue" + "Skip for now"; never blocks.
//   variant="page"  — inside a PixelWindow on /consent, prefilled from the
//                     user's saved row, with a single Save button.
//
// All fields are optional. Each <select> offers a blank placeholder, the
// field's option codes, and an explicit "Prefer not to say". On save we
// POST the full set to /api/demographics (blanks → null). The form is
// style-neutral — it draws labels + selects + buttons and lets the host
// (modal card / PixelWindow) provide the surrounding chrome.

import { useState } from "react";
import { t, type Locale } from "@/lib/translations";
import {
  DEMOGRAPHIC_FIELDS,
  DEMOGRAPHIC_OPTIONS,
  fieldLabelKey,
  optionLabelKey,
  type DemographicField,
  type DemographicValues,
} from "@/lib/demographics";

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-editorial), Georgia, serif";

type Status = "idle" | "saving" | "saved" | "error";

export default function DemographicsForm({
  locale,
  initial,
  variant = "page",
  onDone,
}: {
  locale: Locale;
  initial?: DemographicValues;
  variant?: "gate" | "page";
  onDone?: () => void;
}) {
  const [values, setValues] = useState<Record<DemographicField, string>>(() => {
    const seed = {} as Record<DemographicField, string>;
    for (const f of DEMOGRAPHIC_FIELDS) seed[f] = initial?.[f] ?? "";
    return seed;
  });
  const [status, setStatus] = useState<Status>("idle");

  function set(field: DemographicField, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    setStatus("idle");
  }

  async function save(): Promise<void> {
    setStatus("saving");
    const payload: Record<string, string | null> = {};
    for (const f of DEMOGRAPHIC_FIELDS) {
      payload[f] = values[f] === "" ? null : values[f];
    }
    try {
      const res = await fetch("/api/demographics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus(res.ok || res.status === 204 ? "saved" : "error");
    } catch {
      setStatus("error");
    }
  }

  async function saveAndContinue(): Promise<void> {
    await save();
    // The gate must never trap the user — proceed regardless of outcome.
    onDone?.();
  }

  const statusText =
    status === "saving"
      ? t("demo.saving", locale)
      : status === "saved"
        ? t("demo.saved", locale)
        : status === "error"
          ? t("demo.save_error", locale)
          : "";
  const statusColor =
    status === "saved" ? "#2F5D5C" : status === "error" ? "#9B2C2C" : "var(--color-acc-deep)";

  return (
    <div>
      <div style={{ display: "grid", gap: 14 }}>
        {DEMOGRAPHIC_FIELDS.map((field) => (
          <label key={field} style={{ display: "block" }}>
            <span
              style={{
                display: "block",
                fontFamily: pixel,
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--color-acc-deep)",
                marginBottom: 6,
              }}
            >
              {t(fieldLabelKey(field), locale)}
            </span>
            <select
              value={values[field]}
              onChange={(e) => set(field, e.target.value)}
              style={{
                width: "100%",
                fontFamily: serif,
                fontSize: 15,
                padding: "9px 12px",
                background: "#FFFCF4",
                border: "2px solid var(--color-ink)",
                borderRadius: 0,
                color: "var(--color-ink)",
                cursor: "pointer",
              }}
            >
              <option value="">{t("demo.select_placeholder", locale)}</option>
              {DEMOGRAPHIC_OPTIONS[field].map((code) => (
                <option key={code} value={code}>
                  {t(optionLabelKey(code), locale)}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div
        style={{
          marginTop: 20,
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {variant === "gate" ? (
          <>
            <button
              type="button"
              onClick={saveAndContinue}
              disabled={status === "saving"}
              style={primaryBtn}
            >
              {t("demo.save_continue", locale)}
            </button>
            <button
              type="button"
              onClick={() => onDone?.()}
              style={ghostBtn}
            >
              {t("demo.skip", locale)}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={save}
            disabled={status === "saving"}
            style={primaryBtn}
          >
            {t("btn.save", locale)}
          </button>
        )}
        {statusText && (
          <span
            aria-live="polite"
            style={{ fontFamily: serif, fontSize: 14, color: statusColor }}
          >
            {statusText}
          </span>
        )}
      </div>
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  padding: "12px 18px",
  background: "#F8C75E",
  color: "#1A1820",
  border: "3px solid var(--color-ink)",
  boxShadow: "4px 4px 0 0 #2F5D5C",
  fontFamily: pixel,
  fontSize: 11,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  cursor: "pointer",
};

const ghostBtn: React.CSSProperties = {
  padding: "12px 14px",
  background: "transparent",
  color: "var(--color-ink-soft)",
  border: "2px solid var(--color-acc-deep)",
  fontFamily: pixel,
  fontSize: 11,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  cursor: "pointer",
};
