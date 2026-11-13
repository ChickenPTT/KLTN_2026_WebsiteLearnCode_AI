# Backend Spring Boot
# Buoc 1: build file .jar bang Maven wrapper co san trong du an
FROM eclipse-temurin:26-jdk AS build
WORKDIR /app
COPY mvnw pom.xml ./
COPY .mvn .mvn
# Tai thu vien truoc (Docker cache lai buoc nay, lan build sau nhanh hon)
RUN chmod +x mvnw && ./mvnw -q -B dependency:go-offline
COPY src src
RUN ./mvnw -q -B package -DskipTests

# Buoc 2: chi giu JRE + file .jar cho image nhe
FROM eclipse-temurin:26-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
# JAVA_OPTS dat trong docker-compose.yml (gioi han RAM cho VPS nho)
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
