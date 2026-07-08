# Railway 部署 Dockerfile
FROM node:20-alpine

WORKDIR /app

# 复制所有文件
COPY . .

# 安装后端依赖
RUN cd backend && npm install --production

ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "backend/server.js"]
