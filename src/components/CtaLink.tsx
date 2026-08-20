import Link from "next/link";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "gold";
  className?: string;
};

export function CtaLink({
  href,
  children,
  variant = "primary",
  className = "",
}: Props) {
  return (
    <Link href={href} className={`cta cta--${variant} ${className}`.trim()}>
      {children}
    </Link>
  );
}
