# Use Node 20 base image
FROM node:20

# Set working directory inside the container
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the project files
COPY . .

# Expose port (same as in your server.js)
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
