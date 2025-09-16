import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        {/* Logo and Main Navigation */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Paprika Logo" width={28} height={28} />
            <span className="hidden font-bold sm:inline-block">Paprika</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link
              href="/courses"
              className="font-medium text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Courses
            </Link>
          </nav>
        </div>

        {/* Auth Buttons - This section will be replaced by Clerk */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Sign Up</Link>
          </Button>
          {/* 
            NOTE FOR LATER: When we add Clerk, this div will be replaced with:
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              ... (the buttons above) ...
            </SignedOut>
          */}
        </div>
      </div>
    </header>
  );
};