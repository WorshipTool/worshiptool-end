# Building layer
FROM node:21-bullseye-slim as production

WORKDIR /app


# Copy configuration files
COPY tsconfig*.json ./
COPY package*.json ./

RUN npm ci 
RUN apt-get update




# Install git to be able to clone image-parser repository
RUN apt-get install -y git
RUN npm install rimraf -g
RUN apt-get install -y python3-pip libopencv-dev python3-opencv tesseract-ocr wget
RUN pip3 install --upgrade setuptools pip

# Vytvoření adresáře pro tessdata a stažení trénovaných dat pro Tesseract
ENV TESSDATA_PREFIX /usr/share/tesseract-ocr/4.00/tessdata
RUN mkdir -p $TESSDATA_PREFIX && \
    wget https://github.com/tesseract-ocr/tessdata/raw/main/ces.traineddata -O $TESSDATA_PREFIX/ces.traineddata && \
    wget https://github.com/tesseract-ocr/tessdata/raw/main/slk.traineddata -O $TESSDATA_PREFIX/slk.traineddata

COPY ./src/pythonscripts ./src/pythonscripts
RUN npm run update-parser-repository


# Instalace Python knihoven ze souboru requirements.txt
RUN pip3 install -r src/pythonscripts/image-parser/requirements.txt && \
    python3 src/pythonscripts/image-parser/prepare.py


COPY src src

RUN npm run build

# Expose application port
EXPOSE 3000

# Start application
CMD [ "node", "dist/main.js" ]
