-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChatParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "chatSessionId" TEXT NOT NULL,
    CONSTRAINT "ChatParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ChatParticipant_chatSessionId_fkey" FOREIGN KEY ("chatSessionId") REFERENCES "ChatSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ChatParticipant" ("chatSessionId", "id", "userId") SELECT "chatSessionId", "id", "userId" FROM "ChatParticipant";
DROP TABLE "ChatParticipant";
ALTER TABLE "new_ChatParticipant" RENAME TO "ChatParticipant";
CREATE UNIQUE INDEX "ChatParticipant_userId_chatSessionId_key" ON "ChatParticipant"("userId", "chatSessionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
