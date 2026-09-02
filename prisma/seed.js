const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function upsertUser({ name, username, password, role, teacherUsername }) {
  const passwordHash = await bcrypt.hash(password, 10);
  let teacherId = null;
  if (teacherUsername) {
    const teacher = await prisma.user.findUnique({ where: { username: teacherUsername } });
    teacherId = teacher?.id ?? null;
  }
  return prisma.user.upsert({
    where: { username },
    update: {},
    create: { name, username, passwordHash, role, teacherId },
  });
}

async function main() {
  await prisma.schoolSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      schoolName: "مدرسه کیان",
      tagline: "یادگیری هوشمند برای پایه ششم",
      supportContact: "",
    },
  });

  await upsertUser({
    name: "کتایون",
    username: "kiyan school",
    password: "omid1396",
    role: "ADMIN",
  });

  const teacher = await upsertUser({
    name: "استاد کمال رضایی",
    username: "kamal.rezaei",
    password: "kamal123",
    role: "TEACHER",
  });

  await upsertUser({
    name: "علی محمدی",
    username: "ali.m",
    password: "ali123",
    role: "STUDENT",
    teacherUsername: teacher.username,
  });

  await upsertUser({
    name: "نگار احمدی",
    username: "negar.a",
    password: "negar123",
    role: "STUDENT",
    teacherUsername: teacher.username,
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
