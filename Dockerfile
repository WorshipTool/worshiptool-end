# Building layer
FROM node:21-bullseye-slim as builder

WORKDIR /app


# Copy configuration files
COPY tsconfig*.json ./
COPY package*.json ./

# Fix chromium installation
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
# ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Npm install
RUN apt-get update
# Install dependencies to fix 'canvas' installation
RUN apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
RUN npm ci 
RUN apt-get update




# Install git to be able to clone image-parser repository
RUN apt-get install -y git
RUN npm install rimraf -g
RUN apt-get install -y wget


# Vytvoření adresáře pro tessdata a stažení trénovaných dat pro Tesseract
ENV TESSDATA_PREFIX /usr/share/tesseract-ocr/4.00/tessdata
RUN mkdir -p $TESSDATA_PREFIX && \
    wget https://github.com/tesseract-ocr/tessdata/raw/main/ces.traineddata -O $TESSDATA_PREFIX/ces.traineddata && \
    wget https://github.com/tesseract-ocr/tessdata/raw/main/slk.traineddata -O $TESSDATA_PREFIX/slk.traineddata



RUN apt-get install -y python3-pip libopencv-dev python3-opencv tesseract-ocr
RUN pip3 install --upgrade setuptools pip

COPY ./src/pythonscripts ./src/pythonscripts
RUN npm run update-parser-repository

COPY src src

RUN npm run build && npm prune --production

# Stage 2: Production image
FROM node:21-bullseye-slim as production

WORKDIR /app


RUN apt-get update
RUN apt-get install -y python3-pip libopencv-dev python3-opencv tesseract-ocr
RUN pip3 install --upgrade setuptools pip


# Copy built files from the previous stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src/pythonscripts ./src/pythonscripts

# Instalace Python knihoven ze souboru requirements.txt
RUN pip3 install -r src/pythonscripts/image-parser/requirements.txt 
# && \
#     python3 src/pythonscripts/image-parser/prepare.py


# Expose application port
EXPOSE 3000 

# Start application
CMD [ "node", "dist/main.js" ]
