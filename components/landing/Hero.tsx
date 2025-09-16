import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle } from "lucide-react";

export const Hero = () => {
  return (
    <section className="container mx-auto py-20 text-center md:py-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          Unlock Your Potential with Expert-Led Courses
        </h1>
        <p className="mt-6 text-lg text-muted-foreground md:text-xl">
          Paprika is your gateway to mastering new skills. From development to design, our
          courses are tailored for every step of your career.
        </p>
      </div>
      <div className="mt-8 flex justify-center gap-4">
        <Button size="lg" asChild>
          <Link href="/sign-up">
            Start Learning Now <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/courses">
            <PlayCircle className="mr-2 h-5 w-5" />
            Explore Courses
          </Link>
        </Button>
      </div>

      {/* Hero Image */}
      <div className="relative mx-auto mt-12 w-full max-w-5xl">
        <div className="absolute -inset-2 rounded-lg bg-gradient-to-r from-orange-400 to-rose-400 opacity-25 blur-3xl"></div>
        <Image
          src="/hero-dashboard.png" // IMPORTANT: Add this image to your /public folder
          alt="Paprika LMS Dashboard"
          width={1200}
          height={700}
          className="relative rounded-lg border shadow-2xl"
          priority
        />
      </div>
    </section>
  );
};