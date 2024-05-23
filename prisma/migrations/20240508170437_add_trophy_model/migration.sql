-- CreateTable
CREATE TABLE "Trophy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'BEGINNER',
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "userId" TEXT NOT NULL,
    "subModuleProgressId" TEXT NOT NULL,
    CONSTRAINT "Trophy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Trophy_subModuleProgressId_fkey" FOREIGN KEY ("subModuleProgressId") REFERENCES "SubModuleProgress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
