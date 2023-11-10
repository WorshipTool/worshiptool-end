#!/usr/bin/env python
# coding: utf-8

# # Import all needed

# In[1]:


# !pip3 install numpy
import torch
from matplotlib import pyplot as plt
import numpy as np
import cv2
from PIL import Image


# ## Load input - from arguments

# In[2]:


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


detectionModelPath = "";
inputImagesPath = [];
dictionaryOuputImagesPath = ""

outputConfigPath = ""

show = not USE_ARGUMENTS;

if(USE_ARGUMENTS):
    args = sys.argv
    if '-m' not in args:
        print("Model path (-m) is missing in arguments")
        sys.exit()
    if '-o' not in args:
        print("Output config path (-o) is missing in arguments")
        sys.exit()
    if '-d' not in args:
        print("Output images dictionary path (-d) is missing in arguments")
        sys.exit()
    if '-img' not in args:
        print("Input image/s path (-img) is missing in arguments")
        sys.exit()
    if '--show' in args:
        show = True
        
    mTagIndex = args.index('-m')
    oTagIndex = args.index('-o')
    dTagIndex = args.index('-d')
    imgTagIndex = args.index('-img')
    
    showTagIndex = 0;
    if(show):
        showTagIndex = args.index('--show')
        
    
    detectionModelPath = args[mTagIndex+1]
    outputConfigPath = args[oTagIndex+1]
    dictionaryOuputImagesPath = args[dTagIndex+1]
    
    inputEndIndex = len(args);
    if (mTagIndex > imgTagIndex and mTagIndex < inputEndIndex):
        inputEndIndex = mTagIndex;
    if (oTagIndex > imgTagIndex and oTagIndex < inputEndIndex):
        inputEndIndex = oTagIndex;
    if (showTagIndex > imgTagIndex and showTagIndex < inputEndIndex):
        inputEndIndex = showTagIndex;
        
    inputImagesPath = args[(imgTagIndex+1):inputEndIndex]
        
else:
    detectionModelPath = "../models/240frames.pt"
    inputImagesPath = [
#                         '/Users/pepavlin/Desktop/Snímek obrazovky 2023-08-15 v 0.18.25.png',
#                           '/Users/pepavlin/Desktop/Snímek obrazovky 2023-08-15 v 0.09.57.png',
#                           '/Users/pepavlin/Desktop/Snímek obrazovky 2023-08-15 v 0.20.57.png',
                          '/Users/pepavlin/Desktop/imagesinput/S2850022.JPG',
#                           '/Users/pepavlin/Desktop/image.jpg'
    ]
    outputConfigPath = "results.json"
    dictionaryOuputImagesPath = "images"


    


# # Load model from file

# In[3]:


import ssl
ssl._create_default_https_context = ssl._create_unverified_context

model = torch.hub.load('ultralytics/yolov5', 'custom', path=detectionModelPath, force_reload=True)


# # Define fix skew function

# In[4]:


from scipy.ndimage import rotate 

def fix_skew_angle(img):
    # convert to binary
    wd, ht = img.size
    pix = np.array(img.convert('1').getdata(), np.uint8)
    bin_img = 1 - (pix.reshape((ht, wd)) / 255.0)
#     plt.imshow(bin_img, cmap='gray')
    plt.savefig('binary.png')
    def find_score(arr, angle):
        data = rotate(arr, angle, reshape=False, order=0)
        hist = np.sum(data, axis=1)
        score = np.sum((hist[1:] - hist[:-1]) ** 2)
        return hist, score
    delta = 1
    limit = 5
    angles = np.arange(-limit, limit+delta, delta)
    scores = []
    for angle in angles:
        hist, score = find_score(bin_img, angle)
        scores.append(score)
    best_score = max(scores)
    best_angle = angles[scores.index(best_score)]
#     print('Best angle:', best_angle)
    # correct skew
    data = rotate(np.array(img), best_angle, reshape=False, order=0, cval=255)
    img = Image.fromarray(data)
    return img


# # Make detections and crop

# In[5]:


sheetResults = [];

for img in inputImagesPath:
    resultsPerImg = model(img)
    
    cropsImages = resultsPerImg.crop(save=False)
#     Fix text rotation
    for crop in cropsImages:
        print("New sheet found")
        cropImgData = crop['im']
        cropImg = Image.fromarray(cropImgData,'RGB')
        fixed = fix_skew_angle(cropImg)
        crop['im'] = np.array(fixed)
        
    sheetResults.extend([sheet for sheet in cropsImages])
print("Total:", len(sheetResults), "images")


# # Save into output json file

# In[6]:


import json
import uuid
import os

resultsData = [];

for res in sheetResults:
#     Get target img file path
    imgName = uuid.uuid4().hex + ".jpg";
    imgPath = os.path.join(dictionaryOuputImagesPath, imgName)
    imgAbsPath = os.path.abspath(imgPath);
    
#     Save img into file
    img = res['im']
    img = Image.fromarray(img,'RGB')
    img.save(imgAbsPath)
    if(show): img.show()
    
    confidence = res['conf'].item()
    
    outputData = {
        'imgPath': imgAbsPath,
        'confidence': confidence
    }
    resultsData.append(outputData)

jsonString = json.dumps({
    'results': resultsData
})

with open(outputConfigPath, "w") as outfile:
    outfile.write(jsonString)

print("Output path:", os.path.abspath(outputConfigPath))


# In[ ]:





# In[ ]:




