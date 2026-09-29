# Loopin Messaging - Phase 1

This phase adds the Message Service module and its Flyway schema.

## Install

1. Copy `message-service` into `server/message-service`.
2. Add `<module>message-service</module>` to `server/pom.xml`.
3. Ensure the same DB environment variables used by the other services are available:
   - DB_HOST
   - DB_PORT
   - DB_NAME
   - DB_SCHEMA
   - DB_USER
   - DB_PASSWORD
   - LOOPIN_JWT_SECRET
   - LOOPIN_INTERNAL_API_KEY (optional; falls back to JWT secret as in existing services)
4. From `server`, run:

   mvn -pl message-service -am clean verify

5. Run the service and confirm Flyway creates `conversations`, `conversation_members`, and `messages`.

## Important

No user IDs are foreign keys to the User Service database because the services are separate. Referential checks will be performed at the application/service boundary in later phases.

The `direct_key` column is reserved for a deterministic pair key so a one-to-one conversation cannot be duplicated. The actual generation/lookup logic is implemented in Phase 2.
