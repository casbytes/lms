/*
  Warnings:

  - You are about to drop the `CheckpointToModuleProgress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CheckpointToSubModuleProgress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProgressCheckpointCheckpoint` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProgressTest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TestToModuleProgress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TestToSubModuleProgress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `jsonId` on the `Checkpoint` table. All the data in the column will be lost.
  - You are about to drop the column `moduleId` on the `Checkpoint` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Checkpoint` table. All the data in the column will be lost.
  - You are about to drop the column `subModuleId` on the `Checkpoint` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Checkpoint` table. All the data in the column will be lost.
  - You are about to drop the column `jsonId` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `moduleId` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `subModuleId` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `Project` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Checkpoint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Test` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseProgressId` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseProgressId` to the `Collaborator` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CheckpointToModuleProgress";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CheckpointToSubModuleProgress";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ProgressCheckpointCheckpoint";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ProgressTest";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TestToModuleProgress";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TestToSubModuleProgress";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Checkpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "userId" TEXT NOT NULL,
    "moduleProgressId" TEXT,
    "subModuleProgressId" TEXT,
    CONSTRAINT "Checkpoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Checkpoint_moduleProgressId_fkey" FOREIGN KEY ("moduleProgressId") REFERENCES "ModuleProgress" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Checkpoint_subModuleProgressId_fkey" FOREIGN KEY ("subModuleProgressId") REFERENCES "SubModuleProgress" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Checkpoint" ("id") SELECT "id" FROM "Checkpoint";
DROP TABLE "Checkpoint";
ALTER TABLE "new_Checkpoint" RENAME TO "Checkpoint";
CREATE TABLE "new_Test" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "score" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "attempted" BOOLEAN NOT NULL DEFAULT false,
    "nextAttemptAt" DATETIME,
    "userId" TEXT NOT NULL,
    "moduleProgressId" TEXT,
    "subModuleProgressId" TEXT,
    CONSTRAINT "Test_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Test_moduleProgressId_fkey" FOREIGN KEY ("moduleProgressId") REFERENCES "ModuleProgress" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Test_subModuleProgressId_fkey" FOREIGN KEY ("subModuleProgressId") REFERENCES "SubModuleProgress" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Test" ("id") SELECT "id" FROM "Test";
DROP TABLE "Test";
ALTER TABLE "new_Test" RENAME TO "Test";
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseProgressId" TEXT NOT NULL,
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Project_courseProgressId_fkey" FOREIGN KEY ("courseProgressId") REFERENCES "CourseProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("id", "slug", "title", "userId") SELECT "id", "slug", "title", "userId" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE TABLE "new_Collaborator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "courseProgressId" TEXT NOT NULL,
    CONSTRAINT "Collaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Collaborator_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Collaborator_courseProgressId_fkey" FOREIGN KEY ("courseProgressId") REFERENCES "CourseProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Collaborator" ("id", "projectId", "userId") SELECT "id", "projectId", "userId" FROM "Collaborator";
DROP TABLE "Collaborator";
ALTER TABLE "new_Collaborator" RENAME TO "Collaborator";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
