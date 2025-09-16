import { internalMutation } from "./_generated/server";

export const populate = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Create instructor user
    const instructorId = await ctx.db.insert("users", {
      clerkId: "seed_instructor_001",
      email: "instructor@paprika-lms.com",
      name: "Jane Smith",
      role: "instructor",
      bio: "Full-stack developer with 10+ years of experience",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create sample course 1
    const course1Id = await ctx.db.insert("courses", {
      title: "Ultimate Guide to File Uploads in Next.js",
      slug: "ultimate-guide-file-uploads-nextjs",
      smallDescription:
        "Learn to implement secure file uploads with S3, Cloudinary, and more",
      description: "<p>Master file uploads in Next.js applications...</p>",
      category: "Development",
      level: "Beginner",
      duration: 50,
      price: 50000,
      status: "published",
      instructorId,
      keywords: ["nextjs", "file-upload", "s3", "cloudinary"],
      year: 2025,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create chapters for course 1
    const chapter1Id = await ctx.db.insert("chapters", {
      courseId: course1Id,
      title: "Getting Started",
      description: "Introduction and setup",
      orderIndex: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create lessons for chapter 1
    await ctx.db.insert("lessons", {
      chapterId: chapter1Id,
      courseId: course1Id,
      title: "Introduction to File Uploads",
      description: "Understanding file upload concepts",
      duration: 15,
      orderIndex: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("lessons", {
      chapterId: chapter1Id,
      courseId: course1Id,
      title: "Setting up Next.js Project",
      description: "Project initialization and configuration",
      duration: 20,
      orderIndex: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create sample course 2
    const course2Id = await ctx.db.insert("courses", {
      title: "Master Next.js in 30 Hours",
      slug: "master-nextjs-30-hours",
      smallDescription: "Complete Next.js course from basics to advanced",
      description: "<p>Comprehensive Next.js training...</p>",
      category: "Development",
      level: "Beginner",
      duration: 30,
      price: 30000,
      status: "published",
      instructorId,
      keywords: ["nextjs", "react", "fullstack"],
      year: 2024,
      createdAt: Date.now() - 86400000, // 1 day ago
      updatedAt: Date.now(),
    });

    console.log("Seed data created successfully!");
    return { success: true };
  },
});
