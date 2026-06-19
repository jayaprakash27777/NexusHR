# Build stage
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy Maven wrapper and pom
COPY backend/mvnw backend/mvnw
COPY backend/.mvn backend/.mvn
COPY backend/pom.xml backend/pom.xml

# Make mvnw executable
RUN chmod +x backend/mvnw

# Download dependencies (cached layer)
WORKDIR /app/backend
RUN ./mvnw dependency:go-offline -B 2>/dev/null || true

# Copy source code
COPY backend/src src

# Build the application
RUN ./mvnw package -DskipTests -B

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
