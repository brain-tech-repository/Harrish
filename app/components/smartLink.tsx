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
    event.preventDefault();
    router.push(href);
  }

  return (
    <span {...props} onClick={handleClick}>
      {children}
    </span>
  );
}