# Use lightweight Node image
FROM node:20-slim

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json ./
RUN npm install

# Bundle app source
COPY . .

# App runs on port 3000
EXPOSE 3000

# Start command
CMD [ "node", "server.js" ]