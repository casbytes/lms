/*
  Warnings:

  - You are about to drop the `Article` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `score` on the `SubModule` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Article_slug_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Article";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SubModule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "order" INTEGER NOT NULL,
    "moduleId" TEXT NOT NULL,
    CONSTRAINT "SubModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SubModule" ("id", "moduleId", "order", "slug", "status", "title") SELECT "id", "moduleId", "order", "slug", "status", "title" FROM "SubModule";
DROP TABLE "SubModule";
ALTER TABLE "new_SubModule" RENAME TO "SubModule";
CREATE INDEX "moduleId" ON "SubModule"("moduleId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "subModuleId" ON "Lesson"("subModuleId");

-- CreateIndex
CREATE INDEX "courseId" ON "Module"("courseId");
