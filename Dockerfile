# Building layer
FROM ubuntu:22.04 as development

WORKDIR /app

# Copy configuration files
COPY tsconfig*.json ./
COPY package*.json ./

# Install dependencies from package-lock.json, see https://docs.npmjs.com/cli/v7/commands/npm-ci
RUN npm ci

# Copy application sources (.ts, .tsx, js)
COPY src/ /app/src/

# Build application (produces dist/ folder)
RUN npm run build

# Runtime (production) layer
FROM ubuntu:22.04 as production

WORKDIR /app

# Copy dependencies files
COPY package*.json ./

# Install runtime dependencies (without dev/test dependencies)
RUN npm ci --omit=dev

# Copy production build
COPY --from=development /app/dist/ ./dist/

# Copy application sources
COPY src/ /app/src/

# Expose application port
EXPOSE 3000

# Start application
CMD [ "node", "dist/main.js" ]
