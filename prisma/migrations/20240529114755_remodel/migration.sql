/*
  Warnings:

  - You are about to drop the column `checkpointId` on the `ModuleProgress` table. All the data in the column will be lost.
  - You are about to drop the column `testId` on the `ModuleProgress` table. All the data in the column will be lost.
  - You are about to drop the column `checkpointId` on the `SubModuleProgress` table. All the data in the column will be lost.
  - You are about to drop the column `testId` on the `SubModuleProgress` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Badge` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Checkpoint` table. All the data in the column will be lost.
  - Added the required column `courseProgressId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "_BadgeToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_BadgeToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Badge" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BadgeToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ModuleProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseProgressId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    CONSTRAINT "ModuleProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ModuleProgress_courseProgressId_fkey" FOREIGN KEY ("courseProgressId") REFERENCES "CourseProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ModuleProgress" ("courseProgressId", "id", "score", "slug", "status", "title", "userId") SELECT "courseProgressId", "id", "score", "slug", "status", "title", "userId" FROM "ModuleProgress";
DROP TABLE "ModuleProgress";
ALTER TABLE "new_ModuleProgress" RENAME TO "ModuleProgress";
CREATE TABLE "new_SubModuleProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "moduleProgressId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    CONSTRAINT "SubModuleProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SubModuleProgress_moduleProgressId_fkey" FOREIGN KEY ("moduleProgressId") REFERENCES "ModuleProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SubModuleProgress" ("id", "moduleProgressId", "score", "slug", "status", "title", "userId") SELECT "id", "moduleProgressId", "score", "slug", "status", "title", "userId" FROM "SubModuleProgress";
DROP TABLE "SubModuleProgress";
ALTER TABLE "new_SubModuleProgress" RENAME TO "SubModuleProgress";
CREATE TABLE "new_Badge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "locked_description" TEXT NOT NULL,
    "unlocked_description" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "moduleProgressId" TEXT NOT NULL,
    CONSTRAINT "Badge_moduleProgressId_fkey" FOREIGN KEY ("moduleProgressId") REFERENCES "ModuleProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Badge" ("id", "level", "locked_description", "moduleProgressId", "status", "title", "unlocked_description") SELECT "id", "level", "locked_description", "moduleProgressId", "status", "title", "unlocked_description" FROM "Badge";
DROP TABLE "Badge";
ALTER TABLE "new_Badge" RENAME TO "Badge";
CREATE TABLE "new_Test" (
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
INSERT INTO "new_Test" ("attempted", "attempts", "id", "moduleProgressId", "nextAttemptAt", "score", "status", "subModuleProgressId", "title") SELECT "attempted", "attempts", "id", "moduleProgressId", "nextAttemptAt", "score", "status", "subModuleProgressId", "title" FROM "Test";
DROP TABLE "Test";
ALTER TABLE "new_Test" RENAME TO "Test";
CREATE UNIQUE INDEX "Test_moduleProgressId_key" ON "Test"("moduleProgressId");
CREATE UNIQUE INDEX "Test_subModuleProgressId_key" ON "Test"("subModuleProgressId");
CREATE TABLE "new_CourseProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "CourseProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CourseProgress" ("id", "projectId", "score", "slug", "status", "title", "userId") SELECT "id", "projectId", "score", "slug", "status", "title", "userId" FROM "CourseProgress";
DROP TABLE "CourseProgress";
ALTER TABLE "new_CourseProgress" RENAME TO "CourseProgress";
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "courseProgressId" TEXT NOT NULL,
    CONSTRAINT "Project_courseProgressId_fkey" FOREIGN KEY ("courseProgressId") REFERENCES "CourseProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("id", "slug", "status", "title") SELECT "id", "slug", "status", "title" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_courseProgressId_key" ON "Project"("courseProgressId");
CREATE TABLE "new_Checkpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "moduleProgressId" TEXT,
    "subModuleProgressId" TEXT,
    CONSTRAINT "Checkpoint_moduleProgressId_fkey" FOREIGN KEY ("moduleProgressId") REFERENCES "ModuleProgress" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Checkpoint_subModuleProgressId_fkey" FOREIGN KEY ("subModuleProgressId") REFERENCES "SubModuleProgress" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Checkpoint" ("id", "moduleProgressId", "score", "status", "subModuleProgressId", "title") SELECT "id", "moduleProgressId", "score", "status", "subModuleProgressId", "title" FROM "Checkpoint";
DROP TABLE "Checkpoint";
ALTER TABLE "new_Checkpoint" RENAME TO "Checkpoint";
CREATE UNIQUE INDEX "Checkpoint_moduleProgressId_key" ON "Checkpoint"("moduleProgressId");
CREATE UNIQUE INDEX "Checkpoint_subModuleProgressId_key" ON "Checkpoint"("subModuleProgressId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_BadgeToUser_AB_unique" ON "_BadgeToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_BadgeToUser_B_index" ON "_BadgeToUser"("B");

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
