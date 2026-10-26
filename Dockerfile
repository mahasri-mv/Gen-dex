FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY . .
RUN mkdir -p bin && javac -encoding UTF-8 -d bin -sourcepath src/main/java src/main/java/genomicindex/*.java src/main/java/genomicindex/auth/*.java

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/bin ./bin
COPY --from=build /app/src/main/resources ./src/main/resources
COPY --from=build /app/public ./public
COPY --from=build /app/data ./data
ENV PORT=8080
EXPOSE 8080
CMD ["java", "-cp", "bin", "genomicindex.WebServer"]
