INSERT OR IGNORE INTO "User" (
  "id",
  "email",
  "passwordHash",
  "name",
  "role",
  "createdAt",
  "updatedAt"
)
VALUES (
  'seller_pentagon_automotive_hungary',
  'seller@autopiac.test',
  '$2b$12$duXxC.uwQNJ6eNv9eG.aVObXZZCKptN8syTo0.IXkCqL3Ro4xUd1q',
  'Pentagon Automotive Hungary',
  'USER',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

UPDATE "User"
SET
  "name" = 'Pentagon Automotive Hungary',
  "passwordHash" = '$2b$12$duXxC.uwQNJ6eNv9eG.aVObXZZCKptN8syTo0.IXkCqL3Ro4xUd1q',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "email" = 'seller@autopiac.test';
