# Building layer
FROM node:21-bullseye-slim as production

WORKDIR /app


# Copy configuration files
COPY tsconfig*.json ./
COPY package*.json ./

# Install dependencies from package-lock.json, similar to npm install
RUN npm ci 

RUN npm install rimraf -g

# Install git to be able to install dependencies from git repositories
RUN apt-get update && apt-get install -y git git-lfs && \
    git lfs install


# -------------------- Install dependencies for python ------------------
COPY ./src/pythonscripts ./src/pythonscripts

RUN npm run update-parser-repository

# Aktualizace balíčků a instalace potřebných nástrojů
RUN apt-get update && \
    apt-get install -y python3-pip libopencv-dev python3-opencv tesseract-ocr wget git git-lfs && \
    git lfs install


# Instalace Python knihoven ze souboru requirements.txt
RUN pip3 install --upgrade setuptools pip && \
    pip3 install -r src/pythonscripts/image-parser/requirements.txt && \
    python3 src/pythonscripts/image-parser/prepare.py

# Vytvoření adresáře pro tessdata a stažení trénovaných dat pro Tesseract
ENV TESSDATA_PREFIX /usr/share/tesseract-ocr/4.00/tessdata
RUN mkdir -p $TESSDATA_PREFIX && \
    wget https://github.com/tesseract-ocr/tessdata/raw/main/ces.traineddata -O $TESSDATA_PREFIX/ces.traineddata && \
    wget https://github.com/tesseract-ocr/tessdata/raw/main/slk.traineddata -O $TESSDATA_PREFIX/slk.traineddata
# -------------------- End of python dependencies ------------------



COPY src src

RUN npm run build

# Expose application port
EXPOSE 3000

# Start application
CMD [ "node", "dist/main.js" ]
