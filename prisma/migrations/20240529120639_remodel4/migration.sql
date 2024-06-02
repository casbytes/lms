/*
  Warnings:

  - You are about to drop the `_BadgeToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `userId` on the `CourseProgress` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `LessonProgress` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `SubModuleProgress` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ModuleProgress` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Badge` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_BadgeToUser_B_index";

-- DropIndex
DROP INDEX "_BadgeToUser_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_BadgeToUser";
PRAGMA foreign_keys=on;

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

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Badge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "locked_description" TEXT NOT NULL,
    "unlocked_description" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "userId" TEXT NOT NULL,
    "moduleProgressId" TEXT NOT NULL,
    CONSTRAINT "Badge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Badge_moduleProgressId_fkey" FOREIGN KEY ("moduleProgressId") REFERENCES "ModuleProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Badge" ("id", "level", "locked_description", "moduleProgressId", "status", "title", "unlocked_description") SELECT "id", "level", "locked_description", "moduleProgressId", "status", "title", "unlocked_description" FROM "Badge";
DROP TABLE "Badge";
ALTER TABLE "new_Badge" RENAME TO "Badge";
CREATE TABLE "new_CourseProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS'
);
INSERT INTO "new_CourseProgress" ("id", "score", "slug", "status", "title") SELECT "id", "score", "slug", "status", "title" FROM "CourseProgress";
DROP TABLE "CourseProgress";
ALTER TABLE "new_CourseProgress" RENAME TO "CourseProgress";
CREATE TABLE "new_LessonProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "subModuleProgressId" TEXT NOT NULL,
    CONSTRAINT "LessonProgress_subModuleProgressId_fkey" FOREIGN KEY ("subModuleProgressId") REFERENCES "SubModuleProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LessonProgress" ("id", "slug", "status", "subModuleProgressId", "title") SELECT "id", "slug", "status", "subModuleProgressId", "title" FROM "LessonProgress";
DROP TABLE "LessonProgress";
ALTER TABLE "new_LessonProgress" RENAME TO "LessonProgress";
CREATE TABLE "new_SubModuleProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "moduleProgressId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    CONSTRAINT "SubModuleProgress_moduleProgressId_fkey" FOREIGN KEY ("moduleProgressId") REFERENCES "ModuleProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SubModuleProgress" ("id", "moduleProgressId", "score", "slug", "status", "title") SELECT "id", "moduleProgressId", "score", "slug", "status", "title" FROM "SubModuleProgress";
DROP TABLE "SubModuleProgress";
ALTER TABLE "new_SubModuleProgress" RENAME TO "SubModuleProgress";
CREATE TABLE "new_ModuleProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "courseProgressId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    CONSTRAINT "ModuleProgress_courseProgressId_fkey" FOREIGN KEY ("courseProgressId") REFERENCES "CourseProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ModuleProgress" ("courseProgressId", "id", "score", "slug", "status", "title") SELECT "courseProgressId", "id", "score", "slug", "status", "title" FROM "ModuleProgress";
DROP TABLE "ModuleProgress";
ALTER TABLE "new_ModuleProgress" RENAME TO "ModuleProgress";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

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
