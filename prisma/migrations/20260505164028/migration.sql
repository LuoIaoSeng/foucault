/*
  Warnings:

  - You are about to drop the column `content` on the `InboxMessage` table. All the data in the column will be lost.
  - You are about to drop the column `createAt` on the `InboxMessage` table. All the data in the column will be lost.
  - You are about to drop the column `fromUserId` on the `InboxMessage` table. All the data in the column will be lost.
  - You are about to drop the column `toUserId` on the `InboxMessage` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `InboxMessage` table. All the data in the column will be lost.
  - You are about to drop the column `avator_path` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `User` table. All the data in the column will be lost.
  - Added the required column `messageId` to the `InboxMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverId` to the `InboxMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastname` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "SendMessage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "createAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL,
    CONSTRAINT "SendMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InboxMessage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "messageId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    CONSTRAINT "InboxMessage_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InboxMessage_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "SendMessage" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InboxMessage" ("id") SELECT "id" FROM "InboxMessage";
DROP TABLE "InboxMessage";
ALTER TABLE "new_InboxMessage" RENAME TO "InboxMessage";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstname" TEXT,
    "lastname" TEXT NOT NULL,
    "nickname" TEXT,
    "avatorPath" TEXT,
    "gender" TEXT NOT NULL,
    "birthday" DATETIME NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'student',
    "createAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("birthday", "createAt", "gender", "id", "nickname", "password", "role", "updateAt", "username") SELECT "birthday", "createAt", "gender", "id", "nickname", "password", "role", "updateAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
