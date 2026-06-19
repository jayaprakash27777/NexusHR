# Build stage
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copy pom
COPY backend/pom.xml backend/pom.xml

# Download dependencies (cached layer)
WORKDIR /app/backend
RUN mvn dependency:go-offline -B || true

# Copy source code
COPY backend/src src

# Build the application
RUN mvn package -DskipTests -B

# Production stage
FROM eclipse-temurin:21-jre-alpine AS runtime

# Add non-root user
RUN addgroup -g 1001 nexushr && \
    adduser -u 1001 -G nexushr -D nexushr

WORKDIR /app

# Copy the built jar
COPY --from=builder /app/backend/target/*.jar app.jar

# Set ownership
RUN chown -R nexushr:nexushr /app

USER nexushr

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", \
            "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
