-- AlterTable
ALTER TABLE "User" ADD COLUMN "stripeCustomerId" TEXT;

-- CreateTable
CREATE TABLE "LearningHour" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hours" REAL NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "LearningHour_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
    "moduleProgressId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Badge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Badge_moduleProgressId_fkey" FOREIGN KEY ("moduleProgressId") REFERENCES "ModuleProgress" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Badge" ("id", "level", "locked_description", "moduleProgressId", "status", "title", "unlocked_description", "userId") SELECT "id", "level", "locked_description", "moduleProgressId", "status", "title", "unlocked_description", "userId" FROM "Badge";
DROP TABLE "Badge";
ALTER TABLE "new_Badge" RENAME TO "Badge";
CREATE TABLE "new_Checkpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "moduleProgressId" TEXT,
    "subModuleProgressId" TEXT,
    CONSTRAINT "Checkpoint_moduleProgressId_fkey" FOREIGN KEY ("moduleProgressId") REFERENCES "ModuleProgress" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Checkpoint_subModuleProgressId_fkey" FOREIGN KEY ("subModuleProgressId") REFERENCES "SubModuleProgress" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Checkpoint" ("id", "moduleProgressId", "score", "status", "subModuleProgressId", "title") SELECT "id", "moduleProgressId", "score", "status", "subModuleProgressId", "title" FROM "Checkpoint";
DROP TABLE "Checkpoint";
ALTER TABLE "new_Checkpoint" RENAME TO "Checkpoint";
CREATE UNIQUE INDEX "Checkpoint_moduleProgressId_key" ON "Checkpoint"("moduleProgressId");
CREATE UNIQUE INDEX "Checkpoint_subModuleProgressId_key" ON "Checkpoint"("subModuleProgressId");
CREATE TABLE "new_LessonProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "subModuleProgressId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "LessonProgress_subModuleProgressId_fkey" FOREIGN KEY ("subModuleProgressId") REFERENCES "SubModuleProgress" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LessonProgress" ("id", "order", "slug", "status", "subModuleProgressId", "title") SELECT "id", "order", "slug", "status", "subModuleProgressId", "title" FROM "LessonProgress";
DROP TABLE "LessonProgress";
ALTER TABLE "new_LessonProgress" RENAME TO "LessonProgress";
CREATE TABLE "new_Link" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "projectId" TEXT,
    "checkpointId" TEXT,
    CONSTRAINT "Link_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Link_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "Checkpoint" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Link" ("checkpointId", "id", "projectId", "title", "url") SELECT "checkpointId", "id", "projectId", "title", "url" FROM "Link";
DROP TABLE "Link";
ALTER TABLE "new_Link" RENAME TO "Link";
CREATE TABLE "new_ModuleProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "order" INTEGER NOT NULL,
    "courseProgressId" TEXT NOT NULL,
    CONSTRAINT "ModuleProgress_courseProgressId_fkey" FOREIGN KEY ("courseProgressId") REFERENCES "CourseProgress" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ModuleProgress" ("courseProgressId", "id", "order", "score", "slug", "status", "title") SELECT "courseProgressId", "id", "order", "score", "slug", "status", "title" FROM "ModuleProgress";
DROP TABLE "ModuleProgress";
ALTER TABLE "new_ModuleProgress" RENAME TO "ModuleProgress";
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "courseProgressId" TEXT NOT NULL,
    CONSTRAINT "Project_courseProgressId_fkey" FOREIGN KEY ("courseProgressId") REFERENCES "CourseProgress" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("courseProgressId", "id", "score", "slug", "status", "title") SELECT "courseProgressId", "id", "score", "slug", "status", "title" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_courseProgressId_key" ON "Project"("courseProgressId");
CREATE TABLE "new_SubModuleProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "order" INTEGER NOT NULL,
    "moduleProgressId" TEXT NOT NULL,
    CONSTRAINT "SubModuleProgress_moduleProgressId_fkey" FOREIGN KEY ("moduleProgressId") REFERENCES "ModuleProgress" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SubModuleProgress" ("id", "moduleProgressId", "order", "score", "slug", "status", "title") SELECT "id", "moduleProgressId", "order", "score", "slug", "status", "title" FROM "SubModuleProgress";
DROP TABLE "SubModuleProgress";
ALTER TABLE "new_SubModuleProgress" RENAME TO "SubModuleProgress";
CREATE TABLE "new_TaskComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "projectId" TEXT,
    "checkpointId" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "TaskComment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TaskComment_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "Checkpoint" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TaskComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TaskComment" ("checkpointId", "content", "createdAt", "id", "projectId", "updatedAt", "userId") SELECT "checkpointId", "content", "createdAt", "id", "projectId", "updatedAt", "userId" FROM "TaskComment";
DROP TABLE "TaskComment";
ALTER TABLE "new_TaskComment" RENAME TO "TaskComment";
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
    CONSTRAINT "Test_moduleProgressId_fkey" FOREIGN KEY ("moduleProgressId") REFERENCES "ModuleProgress" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Test_subModuleProgressId_fkey" FOREIGN KEY ("subModuleProgressId") REFERENCES "SubModuleProgress" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Test" ("attempted", "attempts", "id", "moduleProgressId", "nextAttemptAt", "score", "status", "subModuleProgressId", "title") SELECT "attempted", "attempts", "id", "moduleProgressId", "nextAttemptAt", "score", "status", "subModuleProgressId", "title" FROM "Test";
DROP TABLE "Test";
ALTER TABLE "new_Test" RENAME TO "Test";
CREATE UNIQUE INDEX "Test_moduleProgressId_key" ON "Test"("moduleProgressId");
CREATE UNIQUE INDEX "Test_subModuleProgressId_key" ON "Test"("subModuleProgressId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
