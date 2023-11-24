const { execSync } = require('child_process');
const path = require('path');
const repoDir = path.join(__dirname, 'src/pythonscripts/image-parser');

// Funkce pro naklonování nebo aktualizaci repozitáře
const updateRepository = () => {
  try {
    // Naklonování repozitáře, pokud neexistuje
    execSync(`git clone git@github.com:WorshipTool/image-parser.git ${repoDir}`, { stdio: 'inherit' });

    // Aktualizace repozitáře, pokud již existuje
    execSync(`cd ${repoDir} && git pull origin master`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Chyba při nakládání nebo aktualizaci repozitáře:', error.message);
    process.exit(1);
  }
};

// Spuštění funkce pro aktualizaci repozitáře
updateRepository();
