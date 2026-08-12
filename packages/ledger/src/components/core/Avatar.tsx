"use client";

import { useState, type CSSProperties, type HTMLAttributes } from "react";

export type AvatarIndicator = "success" | "warning" | "danger" | "neutral" | "accent";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src?: string;
  name?: string;
  /** Box size in px. Defaults to 32. */
  size?: number;
  /** Small corner status dot. */
  indicator?: AvatarIndicator;
  square?: boolean;
  /** Set when the same name is visibly adjacent — hides the avatar from AT. */
  decorative?: boolean;
}

function initialsOf(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean).slice(0, 2);
  const initials = parts.map((w) => w[0]?.toUpperCase() ?? "").join("");
  return initials || "?";
}

export function Avatar({
  src,
  name = "",
  size = 32,
  indicator,
  square = false,
  decorative = false,
  className,
  style,
  ...rest
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const showImg = Boolean(src) && !failed;
  const classes = ["lg-avatar", square && "lg-avatar--square", className].filter(Boolean).join(" ");

  return (
    <span
      aria-hidden={decorative || undefined}
      className={classes}
      style={{ "--lg-avatar-size": `${size}px`, ...style } as CSSProperties}
      {...rest}
    >
      {showImg ? (
        <img
          src={src}
          alt={decorative ? "" : name}
          width={size}
          height={size}
          loading="lazy"
          ref={(el) => {
            if (el?.complete) setLoaded(true);
          }}
          onError={() => setFailed(true)}
          onLoad={() => setLoaded(true)}
          className={loaded ? "lg-avatar-img lg-avatar-img--loaded" : "lg-avatar-img"}
        />
      ) : (
        <span
          role={!decorative && name ? "img" : undefined}
          aria-label={!decorative && name ? name : undefined}
          className="lg-avatar-fallback"
        >
          {initialsOf(name)}
        </span>
      )}
      {indicator && <span className={`lg-avatar-indicator lg-avatar-indicator--${indicator}`} />}
    </span>
  );
}
