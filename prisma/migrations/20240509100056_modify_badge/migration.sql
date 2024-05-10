-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Badge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "userId" TEXT NOT NULL,
    "moduleProgressId" TEXT NOT NULL,
    CONSTRAINT "Badge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Badge_moduleProgressId_fkey" FOREIGN KEY ("moduleProgressId") REFERENCES "ModuleProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Badge" ("id", "level", "moduleProgressId", "status", "title", "userId") SELECT "id", "level", "moduleProgressId", "status", "title", "userId" FROM "Badge";
DROP TABLE "Badge";
ALTER TABLE "new_Badge" RENAME TO "Badge";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
