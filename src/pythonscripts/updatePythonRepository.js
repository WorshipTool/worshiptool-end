const { exec } = require('child_process');
const path = require('path');

// Set the path to the repository
const repoName = 'image-parser';
const repoPath = path.resolve(__dirname, 'image-parser');

// Set the repository URL
const repoUrl = 'https://github.com/WorshipTool/image-parser.git';

console.log("Repo path: " + repoPath)

// Remove the folder regardless of errors
exec(`rimraf ${repoPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error while deleting folder: ${error}`);
    return;
  }

  console.log(stdout)
  console.log(stderr)

  

  exec(`cd ${repoPath}/.. && mkdir ${repoName}`, (error, stdout, stderr)=>{

    console.log(stdout)
    console.log(stderr)
  
    console.log(`Folder ${repoPath} has been successfully prepared for cloning...`);
  
  
    // Clone the repository
    exec(`git clone ${repoUrl} ${repoPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error while cloning the repository: ${error}`);
        return;
      }


      console.log(stdout)
      console.log(stderr)
    
  
      console.log(`Repository has been successfully cloned to ${repoPath}.`);
    });
    
  })

});
