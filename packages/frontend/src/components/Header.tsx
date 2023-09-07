"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { PropsWithChildren } from "react"
import { cn } from "utils"
import Dev from "./Dev"

export default function Header() {
  const pathname = usePathname()
  console.log(pathname)
  return (
    <div className="flex items-center justify-between py-4">
      <div className={cn("inline-flex", "items-center", "gap-4")}>
        <Link href={"/"}>
          <Image
            src={"/images/glasses.png"}
            alt={"s/o blackboard"}
            width={91}
            height={48}
          />
        </Link>
        <div className={cn("font-aspekta", "flex", "items-center", "gap-3")}>
          <span>MUTUAL Research Library</span>
          <span className={cn("bg-[#97FFC1]", "p-1", "rounded")}>BETA</span>
        </div>
      </div>
      <div className={cn("items-center", "gap-4", "hidden", "md:flex")}>
        <Dev>
          <Link
            href="/create-case"
            className={cn(
              "text-sm",
              "border",
              "border-red-400",
              "border-dashed",
              "p-2",
              "rounded",
            )}
          >
            ~create case~
          </Link>
        </Dev>
        <NavButton isSelected={pathname === "/"} href="/">
          Index
        </NavButton>
        <NavButton
          isSelected={pathname === "/create-case"}
          href="https://www.mutual.supply/"
        >
          Submit
        </NavButton>
        <NavButton href="">Info</NavButton>
      </div>
    </div>
  )
}

interface NavButtonProps {
  href: string
  isSelected?: boolean
}

const NavButton = ({
  href,
  children,
  isSelected,
}: PropsWithChildren<NavButtonProps>) => {
  return (
    <Link
      href={href}
      className={cn(
        "border",
        "border-dashed",
        "rounded-2xl",
        "bg-[#FBFBFB]",
        "border-black",
        "font-aspekta",
        "w-36",
        "h-12",
        "inline-flex",
        "items-center",
        "justify-center",
        { "bg-primary border-transparent text-white": isSelected },
      )}
    >
      {children}
    </Link>
  )
}
