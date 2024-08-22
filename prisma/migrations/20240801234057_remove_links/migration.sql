/*
  Warnings:

  - You are about to drop the `CourseProgress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LessonProgress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Link` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ModuleProgress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubModuleProgress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CourseProgressToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_LessonProgressToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ModuleProgressToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SubModuleProgressToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `moduleProgressId` on the `Badge` table. All the data in the column will be lost.
  - You are about to drop the column `gradingMethod` on the `Checkpoint` table. All the data in the column will be lost.
  - You are about to drop the column `moduleProgressId` on the `Checkpoint` table. All the data in the column will be lost.
  - You are about to drop the column `subModuleProgressId` on the `Checkpoint` table. All the data in the column will be lost.
  - You are about to drop the column `courseProgressId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `gradingMethod` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `moduleProgressId` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `subModuleProgressId` on the `Test` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `moduleId` to the `Badge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_CourseProgressToUser_B_index";

-- DropIndex
DROP INDEX "_CourseProgressToUser_AB_unique";

-- DropIndex
DROP INDEX "_LessonProgressToUser_B_index";

-- DropIndex
DROP INDEX "_LessonProgressToUser_AB_unique";

-- DropIndex
DROP INDEX "_ModuleProgressToUser_B_index";

-- DropIndex
DROP INDEX "_ModuleProgressToUser_AB_unique";

-- DropIndex
DROP INDEX "_SubModuleProgressToUser_B_index";

-- DropIndex
DROP INDEX "_SubModuleProgressToUser_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CourseProgress";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Event";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "LessonProgress";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Link";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ModuleProgress";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SubModuleProgress";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_CourseProgressToUser";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_LessonProgressToUser";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_ModuleProgressToUser";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_SubModuleProgressToUser";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS'
);

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "premium" BOOLEAN NOT NULL DEFAULT true,
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "order" INTEGER NOT NULL,
    "courseId" TEXT,
    CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubModule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "order" INTEGER NOT NULL,
    "moduleId" TEXT NOT NULL,
    CONSTRAINT "SubModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "subModuleId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "Lesson_subModuleId_fkey" FOREIGN KEY ("subModuleId") REFERENCES "SubModule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CourseToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CourseToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CourseToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ModuleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ModuleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Module" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ModuleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_SubModuleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_SubModuleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "SubModule" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_SubModuleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_LessonToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_LessonToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_LessonToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Badge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "locked_description" TEXT NOT NULL,
    "unlocked_description" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "moduleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Badge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Badge_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Badge" ("id", "level", "locked_description", "status", "title", "unlocked_description", "userId") SELECT "id", "level", "locked_description", "status", "title", "unlocked_description", "userId" FROM "Badge";
DROP TABLE "Badge";
ALTER TABLE "new_Badge" RENAME TO "Badge";
CREATE TABLE "new_Checkpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "testEnvironment" TEXT NOT NULL DEFAULT 'node',
    "moduleId" TEXT,
    "subModuleId" TEXT,
    CONSTRAINT "Checkpoint_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Checkpoint_subModuleId_fkey" FOREIGN KEY ("subModuleId") REFERENCES "SubModule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Checkpoint" ("id", "score", "status", "title") SELECT "id", "score", "status", "title" FROM "Checkpoint";
DROP TABLE "Checkpoint";
ALTER TABLE "new_Checkpoint" RENAME TO "Checkpoint";
CREATE UNIQUE INDEX "Checkpoint_moduleId_key" ON "Checkpoint"("moduleId");
CREATE UNIQUE INDEX "Checkpoint_subModuleId_key" ON "Checkpoint"("subModuleId");
CREATE UNIQUE INDEX "Checkpoint_moduleId_subModuleId_key" ON "Checkpoint"("moduleId", "subModuleId");
CREATE TABLE "new_LearningTime" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hours" REAL NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "LearningTime_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LearningTime" ("date", "hours", "id", "userId") SELECT "date", "hours", "id", "userId" FROM "LearningTime";
DROP TABLE "LearningTime";
ALTER TABLE "new_LearningTime" RENAME TO "LearningTime";
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "testEnvironment" TEXT NOT NULL DEFAULT 'node',
    "courseId" TEXT NOT NULL,
    CONSTRAINT "Project_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("id", "score", "slug", "status", "title") SELECT "id", "score", "slug", "status", "title" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_courseId_key" ON "Project"("courseId");
CREATE TABLE "new_Test" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "score" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "attempted" BOOLEAN NOT NULL DEFAULT false,
    "nextAttemptAt" DATETIME,
    "moduleId" TEXT,
    "subModuleId" TEXT,
    CONSTRAINT "Test_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Test_subModuleId_fkey" FOREIGN KEY ("subModuleId") REFERENCES "SubModule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Test" ("attempted", "attempts", "id", "nextAttemptAt", "score", "status", "title") SELECT "attempted", "attempts", "id", "nextAttemptAt", "score", "status", "title" FROM "Test";
DROP TABLE "Test";
ALTER TABLE "new_Test" RENAME TO "Test";
CREATE UNIQUE INDEX "Test_moduleId_key" ON "Test"("moduleId");
CREATE UNIQUE INDEX "Test_subModuleId_key" ON "Test"("subModuleId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_CourseToUser_AB_unique" ON "_CourseToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_CourseToUser_B_index" ON "_CourseToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ModuleToUser_AB_unique" ON "_ModuleToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ModuleToUser_B_index" ON "_ModuleToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SubModuleToUser_AB_unique" ON "_SubModuleToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_SubModuleToUser_B_index" ON "_SubModuleToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_LessonToUser_AB_unique" ON "_LessonToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_LessonToUser_B_index" ON "_LessonToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
