"use client";

import Image from "next/image";
import { useTheme } from "@/context/ThemeProvider";

const FALLBACK_LOGO =
  "https://res.cloudinary.com/dwbbsvsrq/image/upload/v1767085055/finoqz_std7w8.svg";

interface BrandLogoProps {
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

/**
 * Renders the FinoQz logo from the current theme, with automatic fallback
 * to the default Cloudinary SVG if no custom logo has been set.
 */
export default function BrandLogo({
  width = 40,
  height = 40,
  priority = false,
  className = "",
}: BrandLogoProps) {
  const { theme } = useTheme();
  const src = theme.logoUrl || FALLBACK_LOGO;

  return (
    <Image
      src={src}
      alt="FinoQz Logo"
      width={width}
      height={height}
      priority={priority}
      unoptimized
      className={className}
      style={{ height: "auto" }}
    />
  );
}
