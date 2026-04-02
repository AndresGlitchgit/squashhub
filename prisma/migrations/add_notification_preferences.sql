-- Add NotificationPreference table for storing user notification preferences
-- Usage: npx prisma migrate dev --name add_notification_preferences
-- Or run this SQL directly if using raw SQL migrations

CREATE TABLE IF NOT EXISTS "NotificationPreference" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "playerId" TEXT NOT NULL UNIQUE,
  "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
  "whatsappNotifications" BOOLEAN NOT NULL DEFAULT false,
  "emailNotifications" BOOLEAN NOT NULL DEFAULT false,
  "whatsappPhone" TEXT,
  "email" TEXT,
  "bookingReminders" BOOLEAN NOT NULL DEFAULT true,
  "matchConfirmations" BOOLEAN NOT NULL DEFAULT true,
  "rankingUpdates" BOOLEAN NOT NULL DEFAULT true,
  "tournamentUpdates" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "NotificationPreference_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE
);

CREATE INDEX "NotificationPreference_playerId_idx" ON "NotificationPreference"("playerId");
