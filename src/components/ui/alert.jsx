// Alert, Alert Title and Alert Description, with the same names and variant idea as shadcn/ui's alert.
// Written for this project's plain CSS tokens (styles.css), so it needs no Tailwind and no new packages.
// Variants: default, destructive, success, warning. Pass icon={false} to hide the icon or icon={<Node/>} to replace it.
const I = { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, focusable: "false" };
const ICONS = {
  default: <svg {...I}><circle cx="8" cy="8" r="6.25" /><path d="M8 7.25v3.5M8 5.25v.01" /></svg>,
  destructive: <svg {...I}><circle cx="8" cy="8" r="6.25" /><path d="M8 4.75v3.75M8 10.75v.01" /></svg>,
  warning: <svg {...I}><path d="M8 2.5 14 13H2L8 2.5Z" /><path d="M8 6.5v3M8 11.5v.01" /></svg>,
  success: <svg {...I}><circle cx="8" cy="8" r="6.25" /><path d="m5.5 8.25 1.75 1.75 3.25-3.5" /></svg>,
};

export function Alert({ variant = "default", icon, className = "", role, children, ...rest }) {
  const live = role || (variant === "destructive" ? "alert" : "status");
  const glyph = icon === false ? null : icon || ICONS[variant] || ICONS.default;
  return (
    <div role={live} className={`alert ${variant}${glyph ? "" : " no-icon"} ${className}`.trim()} {...rest}>
      {glyph && <span className="alert-icon">{glyph}</span>}
      <div className="alert-body">{children}</div>
    </div>
  );
}

export const AlertTitle = ({ className = "", ...p }) => <div className={`alert-title ${className}`.trim()} {...p} />;
export const AlertDescription = ({ className = "", ...p }) => <div className={`alert-desc ${className}`.trim()} {...p} />;
