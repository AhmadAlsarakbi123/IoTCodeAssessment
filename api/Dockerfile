# Use Node.js LTS as base image
FROM node:lts

# Set working directory and copy files
RUN mkdir -p /app/api
WORKDIR /app/api
COPY package*.json ./
RUN npm set registry https://registry.npmjs.org
RUN npm cache clean --force
RUN npm install

# Default command
CMD ["node", "src/index.js"]