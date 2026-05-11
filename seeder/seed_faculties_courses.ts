import { prisma } from "@/lib/prisma";
import { genSalt, hash } from "bcryptjs";

const main = async () => {
  console.log("Seeding faculties, users, and courses...\n");

  // --- Faculties ---
  const faculties = await Promise.all([
    prisma.faculty.upsert({
      where: { code: "SCI" },
      update: {},
      create: {
        code: "SCI",
        name: "Faculty of Science",
        description:
          "Departments of Mathematics, Physics, Chemistry, Biology, and Computer Science.",
      },
    }),
    prisma.faculty.upsert({
      where: { code: "ENG" },
      update: {},
      create: {
        code: "ENG",
        name: "Faculty of Engineering",
        description:
          "Departments of Mechanical, Electrical, Civil, and Software Engineering.",
      },
    }),
    prisma.faculty.upsert({
      where: { code: "ART" },
      update: {},
      create: {
        code: "ART",
        name: "Faculty of Arts",
        description:
          "Departments of History, Philosophy, Literature, and Languages.",
      },
    }),
    prisma.faculty.upsert({
      where: { code: "BUS" },
      update: {},
      create: {
        code: "BUS",
        name: "Faculty of Business",
        description:
          "Departments of Accounting, Finance, Marketing, and Management.",
      },
    }),
    prisma.faculty.upsert({
      where: { code: "MED" },
      update: {},
      create: {
        code: "MED",
        name: "Faculty of Medicine",
        description:
          "Departments of Surgery, Internal Medicine, Pediatrics, and Public Health.",
      },
    }),
  ]);
  console.log(`Created ${faculties.length} faculties`);

  // --- Educators ---
  const sciFaculty = faculties.find((f) => f.code === "SCI")!;
  const engFaculty = faculties.find((f) => f.code === "ENG")!;
  const artFaculty = faculties.find((f) => f.code === "ART")!;
  const busFaculty = faculties.find((f) => f.code === "BUS")!;

  const pwd = await hash("password", await genSalt());

  const educators = await Promise.all([
    prisma.user.upsert({
      where: { username: "dr.smith" },
      update: {},
      create: {
        username: "dr.smith",
        password: pwd,
        firstname: "John",
        lastname: "Smith",
        nickname: "Prof. Smith",
        role: "EDUCATOR",
        gender: "M",
        birthday: new Date("1975-03-15"),
        facultyId: sciFaculty.id,
      },
    }),
    prisma.user.upsert({
      where: { username: "dr.jones" },
      update: {},
      create: {
        username: "dr.jones",
        password: pwd,
        firstname: "Sarah",
        lastname: "Jones",
        nickname: "Dr. Jones",
        role: "EDUCATOR",
        gender: "F",
        birthday: new Date("1980-07-22"),
        facultyId: engFaculty.id,
      },
    }),
    prisma.user.upsert({
      where: { username: "dr.chen" },
      update: {},
      create: {
        username: "dr.chen",
        password: pwd,
        firstname: "Wei",
        lastname: "Chen",
        nickname: "Prof. Chen",
        role: "EDUCATOR",
        gender: "M",
        birthday: new Date("1978-11-08"),
        facultyId: sciFaculty.id,
      },
    }),
    prisma.user.upsert({
      where: { username: "dr.williams" },
      update: {},
      create: {
        username: "dr.williams",
        password: pwd,
        firstname: "Emily",
        lastname: "Williams",
        nickname: "Dr. Williams",
        role: "EDUCATOR",
        gender: "F",
        birthday: new Date("1982-04-30"),
        facultyId: artFaculty.id,
      },
    }),
    prisma.user.upsert({
      where: { username: "dr.brown" },
      update: {},
      create: {
        username: "dr.brown",
        password: pwd,
        firstname: "Michael",
        lastname: "Brown",
        nickname: "Prof. Brown",
        role: "EDUCATOR",
        gender: "M",
        birthday: new Date("1976-09-12"),
        facultyId: busFaculty.id,
      },
    }),
  ]);
  console.log(`Created ${educators.length} educators`);

  // --- Students ---
  await Promise.all([
    prisma.user.upsert({
      where: { username: "alice" },
      update: {},
      create: {
        username: "alice",
        password: pwd,
        firstname: "Alice",
        lastname: "Johnson",
        role: "STUDENT",
        gender: "F",
        birthday: new Date("2002-05-10"),
        facultyId: sciFaculty.id,
      },
    }),
    prisma.user.upsert({
      where: { username: "bob" },
      update: {},
      create: {
        username: "bob",
        password: pwd,
        firstname: "Bob",
        lastname: "Wilson",
        role: "STUDENT",
        gender: "M",
        birthday: new Date("2001-08-21"),
        facultyId: engFaculty.id,
      },
    }),
    prisma.user.upsert({
      where: { username: "carol" },
      update: {},
      create: {
        username: "carol",
        password: pwd,
        firstname: "Carol",
        lastname: "Davis",
        role: "STUDENT",
        gender: "F",
        birthday: new Date("2002-01-14"),
        facultyId: artFaculty.id,
      },
    }),
  ]);
  console.log("Created 3 students");

  // --- Courses ---
  const courses = await Promise.all([
    prisma.course.upsert({
      where: { code: "CS101" },
      update: {},
      create: {
        code: "CS101",
        name: "Introduction to Computer Science",
        description:
          "Fundamentals of programming, algorithms, and data structures using Python.",
        semester: "2025-Fall",
        educatorId: educators[0].id, // dr.smith
        facultyId: sciFaculty.id,
        content: {
          description:
            "<h2>Course Overview</h2><p>Welcome to CS101! This course introduces the fundamental concepts of computer science including programming basics, algorithms, data structures, and computational thinking.</p><h3>Learning Objectives</h3><ul><li>Write basic Python programs</li><li>Understand common data structures</li><li>Analyze algorithm complexity</li></ul>",
        },
      },
    }),
    prisma.course.upsert({
      where: { code: "CS201" },
      update: {},
      create: {
        code: "CS201",
        name: "Data Structures & Algorithms",
        description:
          "Advanced study of data structures including trees, graphs, and hash tables.",
        semester: "2025-Fall",
        educatorId: educators[2].id, // dr.chen
        facultyId: sciFaculty.id,
      },
    }),
    prisma.course.upsert({
      where: { code: "MATH101" },
      update: {},
      create: {
        code: "MATH101",
        name: "Calculus I",
        description:
          "Limits, derivatives, integrals, and the Fundamental Theorem of Calculus.",
        semester: "2025-Fall",
        educatorId: educators[0].id, // dr.smith
        facultyId: sciFaculty.id,
      },
    }),
    prisma.course.upsert({
      where: { code: "ENG201" },
      update: {},
      create: {
        code: "ENG201",
        name: "Digital Circuit Design",
        description:
          "Boolean algebra, logic gates, combinational and sequential circuits.",
        semester: "2025-Fall",
        educatorId: educators[1].id, // dr.jones
        facultyId: engFaculty.id,
      },
    }),
    prisma.course.upsert({
      where: { code: "HIST101" },
      update: {},
      create: {
        code: "HIST101",
        name: "World History",
        description:
          "Survey of major civilizations and historical events from antiquity to modern era.",
        semester: "2025-Fall",
        educatorId: educators[3].id, // dr.williams
        facultyId: artFaculty.id,
      },
    }),
    prisma.course.upsert({
      where: { code: "MGMT101" },
      update: {},
      create: {
        code: "MGMT101",
        name: "Principles of Management",
        description:
          "Introduction to management theory, organizational behavior, and leadership.",
        semester: "2025-Spring",
        educatorId: educators[4].id, // dr.brown
        facultyId: busFaculty.id,
      },
    }),
    prisma.course.upsert({
      where: { code: "PHYS101" },
      update: {},
      create: {
        code: "PHYS101",
        name: "Physics for Scientists",
        description: "Mechanics, thermodynamics, and wave motion.",
        semester: "2025-Fall",
        educatorId: educators[2].id, // dr.chen
        facultyId: sciFaculty.id,
      },
    }),
  ]);
  console.log(`Created ${courses.length} courses`);

  // --- Enroll students in courses ---
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
  });

  for (const student of students) {
    for (const course of courses.slice(0, 4)) {
      await prisma.enrollment
        .create({
          data: { userId: student.id, courseId: course.id },
        })
        .catch(() => {}); // ignore duplicate
    }
  }
  console.log("Enrolled students in courses");

  console.log("\nSeeding complete!");
};

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
