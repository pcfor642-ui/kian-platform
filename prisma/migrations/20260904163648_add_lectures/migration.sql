-- CreateTable
CREATE TABLE "Lecture" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "studentIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lecture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LectureView" (
    "id" TEXT NOT NULL,
    "lectureId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "watchedSeconds" INTEGER NOT NULL DEFAULT 0,
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LectureView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lecture_teacherId_idx" ON "Lecture"("teacherId");

-- CreateIndex
CREATE INDEX "LectureView_studentId_idx" ON "LectureView"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "LectureView_lectureId_studentId_key" ON "LectureView"("lectureId", "studentId");

-- AddForeignKey
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LectureView" ADD CONSTRAINT "LectureView_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LectureView" ADD CONSTRAINT "LectureView_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
