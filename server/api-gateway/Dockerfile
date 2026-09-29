# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM eclipse-temurin:23-jdk-alpine AS builder
WORKDIR /workspace

COPY pom.xml .
COPY .mvn/ .mvn/
COPY mvnw .
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B --no-transfer-progress 2>/dev/null || true

COPY src ./src
RUN ./mvnw package -DskipTests -B --no-transfer-progress

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:23-jre-alpine
WORKDIR /app

COPY --from=builder /workspace/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
