FROM node:14

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the frontend
RUN npm run build --prefix frontend

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start", "--prefix", "backend"]