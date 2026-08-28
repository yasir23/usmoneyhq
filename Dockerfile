FROM node:20-alpine
WORKDIR /app
# standalone Next.js build (copied by the deploy workflow before docker build)
COPY . ./
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
