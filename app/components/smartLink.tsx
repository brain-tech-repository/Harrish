"use client";

import { useRouter } from "next/navigation";

interface SmartBackLinkProps {
  href: string;   
  children: React.ReactNode;
  [key: string]: any;
}

export default function Link({ href, children, ...props }: SmartBackLinkProps) {
  const router = useRouter();

  function handleClick(event: React.MouseEvent<HTMLSpanElement, MouseEvent>) {
    // Call any custom onClick handler first
    if (typeof props.onClick === "function") {
      props.onClick(event);
    }
    // Only navigate if not prevented and href is not '#'
    if (!event.defaultPrevented && href && href !== "#") {
      event.preventDefault();
      router.push(href);
    }
  }

  return (
    <span {...props} onClick={handleClick}>
      {children}
    </span>
  );
}