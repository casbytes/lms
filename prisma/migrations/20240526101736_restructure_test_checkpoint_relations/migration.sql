/*
  Warnings:

  - Added the required column `checkpointId` to the `SubModuleProgress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testId` to the `SubModuleProgress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `checkpointId` to the `ModuleProgress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testId` to the `ModuleProgress` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SubModuleProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "moduleProgressId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "checkpointId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    CONSTRAINT "SubModuleProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SubModuleProgress_moduleProgressId_fkey" FOREIGN KEY ("moduleProgressId") REFERENCES "ModuleProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SubModuleProgress_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SubModuleProgress_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "Checkpoint" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SubModuleProgress" ("id", "moduleProgressId", "score", "slug", "status", "title", "userId") SELECT "id", "moduleProgressId", "score", "slug", "status", "title", "userId" FROM "SubModuleProgress";
DROP TABLE "SubModuleProgress";
ALTER TABLE "new_SubModuleProgress" RENAME TO "SubModuleProgress";
CREATE TABLE "new_Test" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "score" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "attempted" BOOLEAN NOT NULL DEFAULT false,
    "nextAttemptAt" DATETIME,
    "userId" TEXT NOT NULL,
    "moduleProgressId" TEXT,
    "subModuleProgressId" TEXT,
    CONSTRAINT "Test_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Test" ("attempted", "attempts", "id", "moduleProgressId", "nextAttemptAt", "score", "status", "subModuleProgressId", "title", "userId") SELECT "attempted", "attempts", "id", "moduleProgressId", "nextAttemptAt", "score", "status", "subModuleProgressId", "title", "userId" FROM "Test";
DROP TABLE "Test";
ALTER TABLE "new_Test" RENAME TO "Test";
CREATE TABLE "new_ModuleProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseProgressId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "testId" TEXT NOT NULL,
    "checkpointId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    CONSTRAINT "ModuleProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ModuleProgress_courseProgressId_fkey" FOREIGN KEY ("courseProgressId") REFERENCES "CourseProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ModuleProgress_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ModuleProgress_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "Checkpoint" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ModuleProgress" ("courseProgressId", "id", "score", "slug", "status", "title", "userId") SELECT "courseProgressId", "id", "score", "slug", "status", "title", "userId" FROM "ModuleProgress";
DROP TABLE "ModuleProgress";
ALTER TABLE "new_ModuleProgress" RENAME TO "ModuleProgress";
CREATE TABLE "new_Checkpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "userId" TEXT NOT NULL,
    "moduleProgressId" TEXT,
    "subModuleProgressId" TEXT,
    CONSTRAINT "Checkpoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Checkpoint" ("id", "moduleProgressId", "score", "status", "subModuleProgressId", "title", "userId") SELECT "id", "moduleProgressId", "score", "status", "subModuleProgressId", "title", "userId" FROM "Checkpoint";
DROP TABLE "Checkpoint";
ALTER TABLE "new_Checkpoint" RENAME TO "Checkpoint";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
