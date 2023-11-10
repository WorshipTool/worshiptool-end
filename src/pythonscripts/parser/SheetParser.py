#!/usr/bin/env python
# coding: utf-8

# # Import all needed

# In[106]:


import pytesseract
from pytesseract import Output
import numpy as np

from matplotlib import pyplot as plt
import cv2
import os
import json
import math


# # Load input - from arguments

# In[107]:


import sys #arguments

def type_of_script():
    try:
        ipy_str = str(type(get_ipython()))
        if 'zmqshell' in ipy_str:
            return 'jupyter'
        if 'terminal' in ipy_str:
            return 'ipython'
    except:
        return 'terminal'
    
USE_ARGUMENTS = type_of_script() == 'terminal'

inputConfigPath = ""
outputJsonPath = ""
show = not USE_ARGUMENTS

if USE_ARGUMENTS:
    args = sys.argv;
    if '-i' not in args:
        print("Input path (-i) is missing")
        sys.exit()
    if '-o' not in args:
        print("Output path (-o) is missing")
        sys.exit()
    
    oTagIndex = args.index('-o')
    iTagIndex = args.index('-i')
    
    inputConfigPath = args[iTagIndex+1]
    outputJsonPath = args[oTagIndex+1]

else:
    inputConfigPath = "/Users/pepavlin/Desktop/output.json"
    outputJsonPath = "outputSheetsData.json"


# ## Read input config

# In[108]:


with open(inputConfigPath, 'r') as openfile:
    inputJson = json.load(openfile)
    
inputArray = inputJson['results']
inputImgPaths = [i['imgPath'] for i in inputArray]


# # Make detections

# ## Define functions

# In[109]:


def insert_str(string, str_to_insert, index):
    return string[:index] + str_to_insert + string[index:]


# In[110]:


import re
def is_it_chord(chord):
    chord_pattern = r'\b[A-Ga-gHh][#b]?[mM]?[0-9]?(/[A-Ga-gHh][#b]?)?\b'

    matches = re.fullmatch(chord_pattern, chord)
    if matches:
        return True
    else:
        return False


# In[111]:


# result argument in format: {box: [[leftTopX,leftTopY],[rightBottomX, rightBottomY]], text: string}
def result_to_lines(result):
    lines = []
    # line in format: [centerY, chordLinePossibility, [items]]
    for res in result:
    #   calculate position, center and height of box
        topLeft = res['box'][0]
        bottomRight = res['box'][1]
        center = [(topLeft[0]+bottomRight[0])/2,(topLeft[1]+bottomRight[1])/2]
        height = res['box'][3]

        text = res['text']

        trimmed = text.replace(" ","")
        if(is_it_chord(text)):
            chordPossibility = 1
        else: 
            chordPossibility = 0

        found = False;
        foundLineIndex = 0;
        for index, line in enumerate(lines):
            centerDistance = abs(line[0]-center[1])
            if(centerDistance <= height/2):
                found = True;
                foundLineIndex = index;

        if(found == False):
            lines.append([center[1], chordPossibility, [res]])
        else:
            i = foundLineIndex
            l = len(lines[i][2])
            lines[i][1] = (lines[i][1]* l + chordPossibility)/(l+1)
            lines[i][2].append(res)
    return lines;


# In[112]:


# line in format: [centerY, chordLinePossibility, [items]]
def get_title_from_lines(lines):
    title = ""
    for index, line in enumerate(lines):
        isLyrics = line[1]<0.5;
        if(isLyrics):
            for word in line[2]:
                title += word['text'] + " "
            if(index==0): del lines[0]
            break;
    return title.strip(), lines;


# In[113]:


def split_lines_to_sections(lines):
    # split into sections
    # 1. calculate avg y distance
    minYDistance = 0;
    maxYDistance = 0;
    for index, line in enumerate(lines):
        if(index==0): continue

        distance = abs(line[0] - lines[index-1][0])
        if(minYDistance>distance or index==1): 
            minYDistance = distance;
        if(maxYDistance<distance or index==1): 
            maxYDistance = distance;

    middleDistance = (minYDistance + maxYDistance)/2

    # 2. split
    # format: [lines]
    sections = []
    for index, line in enumerate(lines):
        if(index==0): isNewSection = True;
        else: 
            distance = abs(line[0] - lines[index-1][0])
            isNewSection = distance > middleDistance

        if(isNewSection):
            sections.append([line])
        else:
            sections[len(sections)-1].append(line)
    return sections


# In[114]:


# result argument in format: {box: [[leftTopX,leftTopY],[rightBottomX, rightBottomY]], text: string}
def get_data_from_ocr_result(result):
    lines = result_to_lines(result)
     
    title, lines = get_title_from_lines(lines)

    sections = split_lines_to_sections(lines)
    
    dataSections = [];
    for sectionIndex,section in enumerate(sections):
        dataSection = "{V"+str(sectionIndex+1)+"}";
        for lineIndex, line in enumerate(section):
            isChord = line[1]>0.5
            isAboveLyrics = lineIndex<len(section)-1 and section[lineIndex+1][1]<0.5
            isBelowChords = lineIndex>0 and section[lineIndex-1][1]>0.5

            lineData = "";
            if isChord:
                if isAboveLyrics:
    #                 Add chords to the lyrics string, on correct places
    #                 Parse text from lyrics
                    lyricsLine = section[lineIndex+1]
                    lyricsText = "";
                    for seg in lyricsLine[2]:
                        lyricsText+=seg['text'] + " "
                    lyricsText.strip()

                    editedLyrics = lyricsText

    #                 Get left and right text X positions
                    left = lyricsLine[2][0]['box'][0][0]
                    right = lyricsLine[2][len(lyricsLine[2])-1]['box'][0][0]

                    for chord in line[2][::-1]:
                        chordX = chord['box'][0][0]
                        text = chord['text']
                        
                        if(right-left == 0): continue;
                            
                        placeInLyricsCoef = (chordX - left) / (right-left)
                        charIndex = math.floor(placeInLyricsCoef*len(lyricsText))
                        charIndex = max(charIndex, 0)
                        charIndex = min(charIndex, len(lyricsText)-1)

                        chordText = "["+text+"]"
                        editedLyrics = insert_str(editedLyrics, chordText, charIndex)



                    lineData+=editedLyrics
                else:
                    for segment in line[2]:
                        text = segment['text']
                        lineData+="["+text+"]"

            else:
                
                if not isBelowChords:
                    items = line[2]
                    for seg in items:
                        lineData+=seg['text'] + " "

            if not lineData == "":
                dataSection += lineData;
                dataSection += "\n"
        dataSection = dataSection[:-1]
        dataSections.append(dataSection)
        
#     for line in lines:
#         words = line[2]
#         for word in words:
#             print(word['text'], end=" ")
#         print()
        
        
    finalString = "\n\n".join(dataSections)
    return title, finalString, lines
    


# In[115]:


def getWordDataWithIndex(d, index):
    top = d['top'][index]
    left = d['left'][index]
    width = d['width'][index]
    height = d['height'][index]
    text = d['text'][index]
    
    bottom = top + height;
    right = left + width;
    
    
    return {
        'box': [
            [left, top],
            [right, bottom],
            width, height
        ],
        'text': text
    }

def resultDictToCustomFormat(d):
    count = len(d['text'])
    
    result = [];
    
    
    for i in range(count):
        wordData = getWordDataWithIndex(d, i);
        if(len(wordData['text'])>0):
            result.append(wordData)
#             print(wordData['text'], end=" ")
#     print()
        
    return result


# In[116]:


def displayResultImage(originalImg, result, lines):
    get_ipython().run_line_magic('matplotlib', 'inline')
    
    edited = originalImg;
    for word in result:
        box = word['box'];
        leftTop = box[0];
        rightBottom = box[1]
        
        edited = cv2.rectangle(edited, leftTop, rightBottom, (255,0,0),3)
        
    
    # draw center lines of lines
    for line in lines:
        y = round(line[0])
        start = (0, y)
        end = (originalImg.shape[1], y)
        edited = cv2.line(edited, start, end, (0,150,100), 1)
    
    plt.imshow(edited)
    plt.show()


# ## Preprocess

# In[117]:


def preprocess_image(img):
    edited = img;
    
    edited = cv2.fastNlMeansDenoisingColored(edited,None,10,10,7,21)
#     gray = cv2.cvtColor(edited, cv2.COLOR_BGR2GRAY)
#     edited = cv2.blur(edited, (10,10))
#     ret,edited = cv2.threshold(edited,200,255,cv2.THRESH_BINARY)
    return edited;


# ## Main PROCESS-IMAGE function

# In[118]:


def process_image(img):
    resultDict = pytesseract.image_to_data(img, output_type=Output.DICT,  config='-l ces+slk --psm 6')
    
    result = resultDictToCustomFormat(resultDict)
    
    title, data, lines = get_data_from_ocr_result(result);
    
    if(show):
        displayResultImage(img, result, lines);
#         for line in lines:
#             words = line[2]
#             for word in words:
#                 print(word['text'], end=" ")
#             print()
#         print()
    
    
    return {
        'success': len(result)>0,
        'data':data,
        'title':title
    }


# ## Loop over images

# In[119]:


outputArr = []
for imgPath in inputImgPaths:
    img = cv2.imread(imgPath)
    
    preprocessed_image = preprocess_image(img);
    
#     originalSize = (img.shape[1], img.shape[0])
#     scaleCoef = 1#000/ min(originalSize[0], originalSize[1])
#     targetSize = (math.floor(originalSize[0]*scaleCoef), math.floor(originalSize[1]*scaleCoef))
# #     targetSize = (1000,1000)
#     resized = cv2.resize(img, targetSize)
    
    data = process_image(preprocessed_image)
    if(data['success'] == True):
        if(show):
            print(data['title'].upper())
            print(data['data'])
        
        outputArr.append({
        'title': data['title'],
        'data': data['data'],
        'imgPath': imgPath
        })
    else:
        print("Parsing", imgPath, "wasn't successful. No text found on the image")
    
    


# ## Save result into output json

# In[120]:


outputJson = json.dumps({
    'sheets': outputArr
});

with open(outputJsonPath, 'w') as outputFile:
    outputFile.write(outputJson)
print("Successfuly parsed", len(outputArr), "sheets")


# In[ ]:





# In[ ]:





# In[ ]:




