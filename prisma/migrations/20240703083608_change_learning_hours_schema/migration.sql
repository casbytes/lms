/*
  Warnings:

  - You are about to drop the `LearningHour` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "LearningHour";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "LearningTime" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hours" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "LearningTime_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "jsonId" TEXT NOT NULL,
    "subModuleId" TEXT NOT NULL,
    CONSTRAINT "Lesson_subModuleId_fkey" FOREIGN KEY ("subModuleId") REFERENCES "SubModule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Lesson" ("id", "jsonId", "slug", "subModuleId", "title") SELECT "id", "jsonId", "slug", "subModuleId", "title" FROM "Lesson";
DROP TABLE "Lesson";
ALTER TABLE "new_Lesson" RENAME TO "Lesson";
CREATE UNIQUE INDEX "Lesson_jsonId_key" ON "Lesson"("jsonId");
CREATE TABLE "new_Module" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "jsonId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Module" ("courseId", "id", "jsonId", "slug", "title") SELECT "courseId", "id", "jsonId", "slug", "title" FROM "Module";
DROP TABLE "Module";
ALTER TABLE "new_Module" RENAME TO "Module";
CREATE UNIQUE INDEX "Module_jsonId_key" ON "Module"("jsonId");
CREATE TABLE "new_SubModule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "jsonId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    CONSTRAINT "SubModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SubModule" ("id", "jsonId", "moduleId", "slug", "title") SELECT "id", "jsonId", "moduleId", "slug", "title" FROM "SubModule";
DROP TABLE "SubModule";
ALTER TABLE "new_SubModule" RENAME TO "SubModule";
CREATE UNIQUE INDEX "SubModule_jsonId_key" ON "SubModule"("jsonId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
