"use client";

import { useRouter } from "next/navigation";

interface SmartBackLinkProps {
  href: string;   
  children: React.ReactNode;
  [key: string]: any;
}

export default function Link({ href, children, ...props }: SmartBackLinkProps) {
  const router = useRouter();

  function handleClick(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    if(window.history.length <= 2) router.push(href);
    event.preventDefault();
    router.back();
  }

  return (
    <span {...props} onClick={handleClick}>
      {children}
    </span>
  );
}