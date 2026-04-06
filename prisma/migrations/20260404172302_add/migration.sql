-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT NOT NULL,
    "nickname" TEXT,
    "avator_path" TEXT,
    "gender" TEXT NOT NULL,
    "birthday" DATETIME NOT NULL,
    "createAt" DATETIME NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'student',
    "updateAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avator_path", "birthday", "createAt", "first_name", "gender", "id", "last_name", "nickname", "password", "updateAt", "username") SELECT "avator_path", "birthday", "createAt", "first_name", "gender", "id", "last_name", "nickname", "password", "updateAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
