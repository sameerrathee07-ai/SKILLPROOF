import React from "react";

interface SlideButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "coral" | "emerald";
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function SlideButton({
  variant = "primary",
  children,
  icon,
  className = "",
  disabled,
  ...props
}: SlideButtonProps) {
  const styles = {
    primary: {
      border: "border-slate-900",
      text: "text-slate-900 hover:text-white",
      bgSlide: "bg-slate-900",
    },
    coral: {
      border: "border-rose-500",
      text: "text-rose-500 hover:text-white",
      bgSlide: "bg-rose-500",
    },
    emerald: {
      border: "border-emerald-600",
      text: "text-emerald-600 hover:text-white",
      bgSlide: "bg-emerald-600",
    },
  }[variant];

  return (
    <button
      {...props}
      disabled={disabled}
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-lg border-2 bg-transparent px-5 py-2.5 text-xs font-bold transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${styles.border} ${styles.text} ${className}`}
    >
      {/* Sliding background layer */}
      <span
        className={`absolute inset-0 -translate-x-full transition-transform duration-300 ease-out group-hover:translate-x-0 ${styles.bgSlide}`}
      />

      {/* Button content */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {icon && (
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            {icon}
          </span>
        )}
      </span>
    </button>
  );
}
