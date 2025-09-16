import Link from "next/link";
import Image from "next/image";

export const Footer = () => {
  return (
    <footer className="w-full border-t border-border/40 bg-background/95">
      <div className="container mx-auto grid grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Paprika Logo" width={28} height={28} />
            <span className="text-lg font-semibold">Paprika</span>
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            Learn, grow, and achieve your goals with our expert-led courses.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="font-semibold">Platform</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/courses" className="text-muted-foreground hover:text-foreground">Courses</Link></li>
            <li><Link href="/instructors" className="text-muted-foreground hover:text-foreground">Instructors</Link></li>
            <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">Community</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="#" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
            <li><Link href="#" className="text-muted-foreground hover:text-foreground">Events</Link></li>
            <li><Link href="#" className="text-muted-foreground hover:text-foreground">Discord</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">Legal</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
            <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/40 py-6">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Paprika, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
};