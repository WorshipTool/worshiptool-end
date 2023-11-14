# Building layer
FROM node:16-buster as development

# Optional NPM automation (auth) token build argument
# ARG NPM_TOKEN

# Optionally authenticate NPM registry
# RUN npm set //registry.npmjs.org/:_authToken ${NPM_TOKEN}

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
FROM node:16-buster as production

# Optional NPM automation (auth) token build argument
# ARG NPM_TOKEN

# Optionally authenticate NPM registry
# RUN npm set //registry.npmjs.org/:_authToken ${NPM_TOKEN}

# Instalace Pythonu a dalších balíčků
RUN apt-get update && apt-get install -y python3 python3-pip libstdc++
RUN apt-get install -y build-essential
RUN pip install torch===2.1.0+cpu torchvision===0.2.2 torchaudio==2.1.0+cpu  -f https://download.pytorch.org/whl/torch_stable.html

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
