FROM node:22-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.ts tsconfig*.json ./
COPY src ./src
RUN npm run build

FROM golang:1.25-alpine AS backend
WORKDIR /app
COPY backend/ ./
RUN CGO_ENABLED=0 go build -trimpath -o /server .

FROM alpine:3.22
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=backend /server ./server
COPY --from=frontend /app/dist ./dist
ENV STATIC_DIR=/app/dist PORT=8080
USER 65532:65532
EXPOSE 8080
CMD ["./server"]
