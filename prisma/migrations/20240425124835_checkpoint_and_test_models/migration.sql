/*
  Warnings:

  - You are about to drop the column `checkpointId` on the `CheckpointToModuleProgress` table. All the data in the column will be lost.
  - You are about to drop the column `attempted` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `attempts` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `nextAttemptAt` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `checkpointId` on the `CheckpointToSubModuleProgress` table. All the data in the column will be lost.
  - You are about to drop the column `checkpointToModuleProgressId` on the `Checkpoint` table. All the data in the column will be lost.
  - You are about to drop the column `checkpointToSubModuleProgressId` on the `Checkpoint` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `Checkpoint` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Checkpoint` table. All the data in the column will be lost.
  - Added the required column `progressCheckpointId` to the `CheckpointToModuleProgress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jsonId` to the `Test` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Test` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Test` table without a default value. This is not possible if the table is not empty.
  - Added the required column `progressCheckpointId` to the `CheckpointToSubModuleProgress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jsonId` to the `Checkpoint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Checkpoint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Checkpoint` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "ProgressCheckpointCheckpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "checkpointToModuleProgressId" TEXT NOT NULL,
    "checkpointToSubModuleProgressId" TEXT NOT NULL,
    CONSTRAINT "ProgressCheckpointCheckpoint_checkpointToModuleProgressId_fkey" FOREIGN KEY ("checkpointToModuleProgressId") REFERENCES "CheckpointToModuleProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProgressCheckpointCheckpoint_checkpointToSubModuleProgressId_fkey" FOREIGN KEY ("checkpointToSubModuleProgressId") REFERENCES "CheckpointToSubModuleProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProgressTest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "score" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "attempted" BOOLEAN NOT NULL DEFAULT false,
    "nextAttemptAt" DATETIME
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TestToSubModuleProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testId" TEXT NOT NULL,
    "subModuleProgressId" TEXT NOT NULL,
    CONSTRAINT "TestToSubModuleProgress_subModuleProgressId_fkey" FOREIGN KEY ("subModuleProgressId") REFERENCES "SubModuleProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TestToSubModuleProgress_testId_fkey" FOREIGN KEY ("testId") REFERENCES "ProgressTest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TestToSubModuleProgress" ("id", "subModuleProgressId", "testId") SELECT "id", "subModuleProgressId", "testId" FROM "TestToSubModuleProgress";
DROP TABLE "TestToSubModuleProgress";
ALTER TABLE "new_TestToSubModuleProgress" RENAME TO "TestToSubModuleProgress";
CREATE TABLE "new_CheckpointToModuleProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moduleProgressId" TEXT NOT NULL,
    "progressCheckpointId" TEXT NOT NULL,
    CONSTRAINT "CheckpointToModuleProgress_moduleProgressId_fkey" FOREIGN KEY ("moduleProgressId") REFERENCES "ModuleProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CheckpointToModuleProgress" ("id", "moduleProgressId") SELECT "id", "moduleProgressId" FROM "CheckpointToModuleProgress";
DROP TABLE "CheckpointToModuleProgress";
ALTER TABLE "new_CheckpointToModuleProgress" RENAME TO "CheckpointToModuleProgress";
CREATE TABLE "new_Test" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "jsonId" TEXT NOT NULL,
    "subModuleId" TEXT,
    "moduleId" TEXT,
    CONSTRAINT "Test_subModuleId_fkey" FOREIGN KEY ("subModuleId") REFERENCES "SubModule" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Test_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Test" ("id") SELECT "id" FROM "Test";
DROP TABLE "Test";
ALTER TABLE "new_Test" RENAME TO "Test";
CREATE UNIQUE INDEX "Test_jsonId_key" ON "Test"("jsonId");
CREATE TABLE "new_CheckpointToSubModuleProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subModuleProgressId" TEXT NOT NULL,
    "progressCheckpointId" TEXT NOT NULL,
    CONSTRAINT "CheckpointToSubModuleProgress_subModuleProgressId_fkey" FOREIGN KEY ("subModuleProgressId") REFERENCES "SubModuleProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CheckpointToSubModuleProgress" ("id", "subModuleProgressId") SELECT "id", "subModuleProgressId" FROM "CheckpointToSubModuleProgress";
DROP TABLE "CheckpointToSubModuleProgress";
ALTER TABLE "new_CheckpointToSubModuleProgress" RENAME TO "CheckpointToSubModuleProgress";
CREATE TABLE "new_Checkpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "jsonId" TEXT NOT NULL,
    "subModuleId" TEXT,
    "moduleId" TEXT,
    CONSTRAINT "Checkpoint_subModuleId_fkey" FOREIGN KEY ("subModuleId") REFERENCES "SubModule" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Checkpoint_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Checkpoint" ("id") SELECT "id" FROM "Checkpoint";
DROP TABLE "Checkpoint";
ALTER TABLE "new_Checkpoint" RENAME TO "Checkpoint";
CREATE UNIQUE INDEX "Checkpoint_jsonId_key" ON "Checkpoint"("jsonId");
CREATE TABLE "new_TestToModuleProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testId" TEXT NOT NULL,
    "moduleProgressId" TEXT NOT NULL,
    CONSTRAINT "TestToModuleProgress_moduleProgressId_fkey" FOREIGN KEY ("moduleProgressId") REFERENCES "ModuleProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TestToModuleProgress_testId_fkey" FOREIGN KEY ("testId") REFERENCES "ProgressTest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TestToModuleProgress" ("id", "moduleProgressId", "testId") SELECT "id", "moduleProgressId", "testId" FROM "TestToModuleProgress";
DROP TABLE "TestToModuleProgress";
ALTER TABLE "new_TestToModuleProgress" RENAME TO "TestToModuleProgress";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
