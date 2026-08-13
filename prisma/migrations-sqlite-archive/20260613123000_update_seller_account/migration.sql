UPDATE "User"
SET
  "name" = 'Pentagon Automotive Hungary',
  "passwordHash" = '$2b$12$duXxC.uwQNJ6eNv9eG.aVObXZZCKptN8syTo0.IXkCqL3Ro4xUd1q',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "email" = 'seller@autopiac.test';
