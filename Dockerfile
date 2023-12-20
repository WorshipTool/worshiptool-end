# Building layer
FROM node:21-bullseye-slim as development

WORKDIR /app


# Copy configuration files
COPY tsconfig*.json ./
COPY package*.json ./

# Install dependencies from package-lock.json, see https://docs.npmjs.com/cli/v7/commands/npm-ci
RUN npm ci

# # Copy application sources (.ts, .tsx, js)
COPY src/ /app/src/

RUN npm install rimraf -g

# Install git to be able to install dependencies from git repositories
RUN apt-get update && apt-get install -y git git-lfs && \
    git lfs install

# Build application (produces dist/ folder)
RUN npm run build

# Runtime (production) layer
FROM node:21-bullseye-slim as production


WORKDIR /app



# Copy dependencies files
COPY package*.json ./

# Install runtime dependencies (without dev/test dependencies)
RUN npm ci --omit=dev

# Copy production build
COPY --from=development /app/dist/ ./dist/

# Copy production build
COPY --from=development /app/src/pythonscripts/ ./src/pythonscripts/



# -------------------- Install dependencies for python ------------------

# Aktualizace balíčků a instalace potřebných nástrojů
# Aktualizace balíčků a instalace potřebných nástrojů
RUN apt-get update && \
    apt-get install -y python3-pip libopencv-dev python3-opencv tesseract-ocr wget git git-lfs && \
    git lfs install


# Instalace Python knihoven ze souboru requirements.txt
RUN pip3 install --upgrade setuptools pip
    # pip3 install -r /src/pythonscripts/requirements.txt

# Vytvoření adresáře pro tessdata a stažení trénovaných dat pro Tesseract
ENV TESSDATA_PREFIX /usr/share/tesseract-ocr/4.00/tessdata
RUN mkdir -p $TESSDATA_PREFIX && \
    wget https://github.com/tesseract-ocr/tessdata/raw/main/ces.traineddata -O $TESSDATA_PREFIX/ces.traineddata && \
    wget https://github.com/tesseract-ocr/tessdata/raw/main/slk.traineddata -O $TESSDATA_PREFIX/slk.traineddata
# -------------------- End of python dependencies ------------------


# # Copy application sources
# COPY src/ /app/src/

# Expose application port
EXPOSE 3000

# Start application
CMD [ "node", "dist/main.js" ]
