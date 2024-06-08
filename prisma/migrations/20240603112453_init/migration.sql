-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "googleId" TEXT,
    "githubId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "currentUrl" TEXT
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL,
    "jsonId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "jsonId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubModule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "jsonId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    CONSTRAINT "SubModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "jsonId" TEXT NOT NULL,
    "subModuleId" TEXT NOT NULL,
    CONSTRAINT "Lesson_subModuleId_fkey" FOREIGN KEY ("subModuleId") REFERENCES "SubModule" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CourseProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS'
);

-- CreateTable
CREATE TABLE "ModuleProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "order" INTEGER NOT NULL,
    "courseProgressId" TEXT NOT NULL,
    CONSTRAINT "ModuleProgress_courseProgressId_fkey" FOREIGN KEY ("courseProgressId") REFERENCES "CourseProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubModuleProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "order" INTEGER NOT NULL,
    "moduleProgressId" TEXT NOT NULL,
    CONSTRAINT "SubModuleProgress_moduleProgressId_fkey" FOREIGN KEY ("moduleProgressId") REFERENCES "ModuleProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LessonProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "subModuleProgressId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "LessonProgress_subModuleProgressId_fkey" FOREIGN KEY ("subModuleProgressId") REFERENCES "SubModuleProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "locked_description" TEXT NOT NULL,
    "unlocked_description" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "moduleProgressId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Badge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Badge_moduleProgressId_fkey" FOREIGN KEY ("moduleProgressId") REFERENCES "ModuleProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Checkpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "moduleProgressId" TEXT,
    "subModuleProgressId" TEXT,
    CONSTRAINT "Checkpoint_moduleProgressId_fkey" FOREIGN KEY ("moduleProgressId") REFERENCES "ModuleProgress" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Checkpoint_subModuleProgressId_fkey" FOREIGN KEY ("subModuleProgressId") REFERENCES "SubModuleProgress" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Test" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "score" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "attempted" BOOLEAN NOT NULL DEFAULT false,
    "nextAttemptAt" DATETIME,
    "moduleProgressId" TEXT,
    "subModuleProgressId" TEXT,
    CONSTRAINT "Test_moduleProgressId_fkey" FOREIGN KEY ("moduleProgressId") REFERENCES "ModuleProgress" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Test_subModuleProgressId_fkey" FOREIGN KEY ("subModuleProgressId") REFERENCES "SubModuleProgress" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "courseProgressId" TEXT NOT NULL,
    CONSTRAINT "Project_courseProgressId_fkey" FOREIGN KEY ("courseProgressId") REFERENCES "CourseProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CourseProgressToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CourseProgressToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "CourseProgress" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CourseProgressToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ModuleProgressToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ModuleProgressToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "ModuleProgress" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ModuleProgressToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_SubModuleProgressToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_SubModuleProgressToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "SubModuleProgress" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_SubModuleProgressToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_LessonProgressToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_LessonProgressToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "LessonProgress" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_LessonProgressToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CheckpointToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CheckpointToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Checkpoint" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CheckpointToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_TestToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TestToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Test" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TestToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ProjectToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ProjectToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ProjectToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "Course_jsonId_key" ON "Course"("jsonId");

-- CreateIndex
CREATE UNIQUE INDEX "Module_jsonId_key" ON "Module"("jsonId");

-- CreateIndex
CREATE UNIQUE INDEX "SubModule_jsonId_key" ON "SubModule"("jsonId");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_jsonId_key" ON "Lesson"("jsonId");

-- CreateIndex
CREATE UNIQUE INDEX "Checkpoint_moduleProgressId_key" ON "Checkpoint"("moduleProgressId");

-- CreateIndex
CREATE UNIQUE INDEX "Checkpoint_subModuleProgressId_key" ON "Checkpoint"("subModuleProgressId");

-- CreateIndex
CREATE UNIQUE INDEX "Test_moduleProgressId_key" ON "Test"("moduleProgressId");

-- CreateIndex
CREATE UNIQUE INDEX "Test_subModuleProgressId_key" ON "Test"("subModuleProgressId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_courseProgressId_key" ON "Project"("courseProgressId");

-- CreateIndex
CREATE UNIQUE INDEX "_CourseProgressToUser_AB_unique" ON "_CourseProgressToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_CourseProgressToUser_B_index" ON "_CourseProgressToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ModuleProgressToUser_AB_unique" ON "_ModuleProgressToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ModuleProgressToUser_B_index" ON "_ModuleProgressToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SubModuleProgressToUser_AB_unique" ON "_SubModuleProgressToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_SubModuleProgressToUser_B_index" ON "_SubModuleProgressToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_LessonProgressToUser_AB_unique" ON "_LessonProgressToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_LessonProgressToUser_B_index" ON "_LessonProgressToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CheckpointToUser_AB_unique" ON "_CheckpointToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_CheckpointToUser_B_index" ON "_CheckpointToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TestToUser_AB_unique" ON "_TestToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_TestToUser_B_index" ON "_TestToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectToUser_AB_unique" ON "_ProjectToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectToUser_B_index" ON "_ProjectToUser"("B");
