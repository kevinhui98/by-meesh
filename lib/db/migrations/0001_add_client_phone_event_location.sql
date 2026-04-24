ALTER TABLE "event_requests"
  ADD COLUMN "client_phone" text NOT NULL DEFAULT '',
  ADD COLUMN "event_location" text NOT NULL DEFAULT '';

ALTER TABLE "event_requests"
  ALTER COLUMN "client_phone" DROP DEFAULT,
  ALTER COLUMN "event_location" DROP DEFAULT;
