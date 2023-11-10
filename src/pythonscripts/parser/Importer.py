#!/usr/bin/env python
# coding: utf-8

# # Import all needed

# In[11]:


import os
import subprocess


# # Process input

# ## From arguments

# In[12]:


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

parserOutputPath = ""
detectorPath = ""
detectorOutputPath = ""
detectionModelPath = ""
parserPath = ""
detectorOutputImagesFolderPath = ""

inputImgPaths = []

if(USE_ARGUMENTS):
    args = sys.argv
    if '-d' not in args:
        print("Detector script path (-d) is missing.")
        sys.exit()
    if '-f' not in args:
        print("Detector output images folder path (-f) is missing.")
        sys.exit()
    if '-m' not in args:
        print("Detection-model path (-m) is missing.")
        sys.exit()
    if '-t' not in args:
        print("Temp-json path (-t) is missing.")
        sys.exit()
    if '-p' not in args:
        print("Parser script path (-p) is missing.")
        sys.exit()
    if '-o' not in args:
        print("Output json-file path (-o) is missing")
        sys.exit()
    if '-i' not in args:
        print("Input images (-i) is missing")
        sys.exit()
    
    dTagIndex = args.index('-d')
    fTagIndex = args.index('-f')
    mTagIndex = args.index('-m')
    tTagIndex = args.index('-t')
    pTagIndex = args.index('-p')
    oTagIndex = args.index('-o')
    iTagIndex = args.index('-i')
    
    detectorPath = args[dTagIndex+1]
    detectorOutputImagesFolderPath = args[fTagIndex+1]
    detectionModelPath = args[mTagIndex+1]
    parserPath = args[pTagIndex+1]
    parserOutputPath = args[oTagIndex+1]
    
    
    detectorOutputPath = args[tTagIndex+1]
    
    iTagEndIndex = len(args)
    if(oTagIndex>iTagIndex):
        iTagEndIndex = oTagIndex
        
    inputImgPaths = args[(iTagIndex+1):iTagEndIndex]
    
    if(iTagEndIndex-iTagIndex <= 1):
        print("No input images.")
        sys.exit()
    
    
else:
    inputImgPaths = [
        "/Users/pepavlin/Desktop/Snímek obrazovky 2023-08-15 v 0.18.25.png"
    ]
    parserOutputPath = "/Users/pepavlin/Desktop/finalOutputData.json"
    detectorOutputImagesFolderPath = "images"
    detectorPath = "/Users/pepavlin/Desktop/Sheet Detection.py"
    parserPath = "/Users/pepavlin/Desktop/Sheet parser.py"
    detectionModelPath = "/Users/pepavlin/Workspace/Programming/WorshipTool/image-parser/detection/models/240frames.pt"
    detectorOutputPath = "/Users/pepavlin/Desktop/detectorOutputPath.json"


# # Run scripts

# ## Prepare

# In[13]:


try: 
    os.mkdir(detectorOutputImagesFolderPath)
    print("Images folder created")
except OSError as error:
    print("", end="")


# ## Run

# ### Detect images

# In[14]:


detectArgArr = ["python3", detectorPath, 
    "-d", detectorOutputImagesFolderPath,
    "-m", detectionModelPath,
    "-o", detectorOutputPath,
    "-img"]
detectArgArr.extend(inputImgPaths)


subprocess.run(detectArgArr)


# ### Parse images

# In[15]:


parserArgArr = ["python3", parserPath,
    "-i", detectorOutputPath,
    "-o", parserOutputPath]

subprocess.run(parserArgArr)


# ### Show results

# In[16]:


# subprocess.run(["open", parserOutputPath])


# In[ ]:





# In[ ]:




