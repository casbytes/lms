/*
  Warnings:

  - Added the required column `order` to the `ModuleProgress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `SubModuleProgress` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ModuleProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "order" INTEGER NOT NULL,
    "courseProgressId" TEXT NOT NULL,
    CONSTRAINT "ModuleProgress_courseProgressId_fkey" FOREIGN KEY ("courseProgressId") REFERENCES "CourseProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ModuleProgress" ("courseProgressId", "id", "score", "slug", "status", "title") SELECT "courseProgressId", "id", "score", "slug", "status", "title" FROM "ModuleProgress";
DROP TABLE "ModuleProgress";
ALTER TABLE "new_ModuleProgress" RENAME TO "ModuleProgress";
CREATE TABLE "new_SubModuleProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "order" INTEGER NOT NULL,
    "moduleProgressId" TEXT NOT NULL,
    CONSTRAINT "SubModuleProgress_moduleProgressId_fkey" FOREIGN KEY ("moduleProgressId") REFERENCES "ModuleProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SubModuleProgress" ("id", "moduleProgressId", "score", "slug", "status", "title") SELECT "id", "moduleProgressId", "score", "slug", "status", "title" FROM "SubModuleProgress";
DROP TABLE "SubModuleProgress";
ALTER TABLE "new_SubModuleProgress" RENAME TO "SubModuleProgress";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
