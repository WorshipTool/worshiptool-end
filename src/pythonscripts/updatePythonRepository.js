const { exec } = require('child_process');
const path = require('path');

// Set the path to the repository
const repoName = 'image-parser';
const repoPath = path.resolve(__dirname, 'image-parser');

// Set the repository URL
const repoUrl = 'https://github.com/WorshipTool/image-parser.git';


// Remove the folder regardless of errors
exec(`rimraf ${repoPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error while deleting folder: ${error}`);
    return;
  }

  exec(`cd ${repoPath}/.. && mkdir ${repoName}`, ()=>{
    console.log(`Folder ${repoPath} has been successfully prepared for cloning...`);
  
    // Clone the repository
    exec(`git clone ${repoUrl} ${repoPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error while cloning the repository: ${error}`);
        return;
      }
  
      console.log(`Repository has been successfully cloned to ${repoPath}.`);
    });
    
  })

});
