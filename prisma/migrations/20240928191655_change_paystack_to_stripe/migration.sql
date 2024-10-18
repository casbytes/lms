/*
  Warnings:

  - You are about to drop the column `paystackCustomerCode` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "avatarUrl" TEXT,
    "stripeCustomerId" TEXT,
    "githubUsername" TEXT,
    "subscribed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "completedOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "authState" TEXT,
    "verificationToken" TEXT,
    "currentUrl" TEXT
);
INSERT INTO "new_User" ("authState", "avatarUrl", "completedOnboarding", "createdAt", "currentUrl", "email", "githubUsername", "id", "name", "role", "subscribed", "updatedAt", "verificationToken", "verified") SELECT "authState", "avatarUrl", "completedOnboarding", "createdAt", "currentUrl", "email", "githubUsername", "id", "name", "role", "subscribed", "updatedAt", "verificationToken", "verified" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
