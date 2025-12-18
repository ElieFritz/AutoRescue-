/**
 * Script pour réparer les fichiers cassés par le script de correction d'encodage
 * Usage: node scripts/fix-broken-code.js
 */

const fs = require('fs');
const path = require('path');

// Répertoires à scanner
const DIRS_TO_SCAN = [
  path.join(__dirname, '..', 'app'),
  path.join(__dirname, '..', 'components'),
  path.join(__dirname, '..', 'lib'),
  path.join(__dirname, '..', 'stores'),
];

// Corrections pour les mots anglais cassés (C remplacé par e)
const FIXES = [
  // Lucide icons
  { bad: /\bear\b/g, good: 'Car' },
  { bad: /\beard\b/g, good: 'Card' },
  { bad: /\beardContent\b/g, good: 'CardContent' },
  { bad: /\beardHeader\b/g, good: 'CardHeader' },
  { bad: /\beardTitle\b/g, good: 'CardTitle' },
  { bad: /\beardDescription\b/g, good: 'CardDescription' },
  { bad: /\beardFooter\b/g, good: 'CardFooter' },
  { bad: /\bheckCircle\b/g, good: 'CheckCircle' },
  { bad: /\bheck\b/g, good: 'Check' },
  { bad: /\bircle\b/g, good: 'Circle' },
  { bad: /\block\b/g, good: 'Clock' },
  { bad: /\bopy\b/g, good: 'Copy' },
  { bad: /\bredit\b/g, good: 'Credit' },
  { bad: /\bredit\b/g, good: 'Credit' },
  { bad: /\brediteard\b/g, good: 'CreditCard' },
  
  // React/Next imports
  { bad: /\beomponent\b/g, good: 'Component' },
  { bad: /\beomponents\b/g, good: 'Components' },
  { bad: /\bontext\b/g, good: 'Context' },
  { bad: /\bontent\b/g, good: 'Content' },
  { bad: /\burrentUser\b/g, good: 'CurrentUser' },
  
  // CSS/Classes
  { bad: /\belass/g, good: 'class' },
  { bad: /\belassName/g, good: 'className' },
  { bad: /\belasses/g, good: 'classes' },
  { bad: /\beolor/g, good: 'color' },
  
  // Functions/Methods
  { bad: /\bellback/g, good: 'callback' },
  { bad: /\beatch/g, good: 'catch' },
  { bad: /\bonst /g, good: 'const ' },
  { bad: /\bonsole/g, good: 'console' },
  { bad: /\bonfigService/g, good: 'ConfigService' },
  { bad: /\bonfig/g, good: 'Config' },
  { bad: /\blient/g, good: 'Client' },
  { bad: /\blipboard/g, good: 'Clipboard' },
  { bad: /\blose/g, good: 'Close' },
  { bad: /\benter/g, good: 'Center' },
  { bad: /\breate/g, good: 'Create' },
  { bad: /\bhange/g, good: 'Change' },
  { bad: /\bhildren/g, good: 'Children' },
  
  // Common words in code
  { bad: /eommencer/g, good: 'Commencer' },
  { bad: /eonnecter/g, good: 'connecter' },
  { bad: /eonnexion/g, good: 'Connexion' },
  { bad: /eTA /g, good: 'CTA ' },
  { bad: /eompte/g, good: 'Compte' },
  { bad: /eonfirm/g, good: 'Confirm' },
  { bad: /eontact/g, good: 'Contact' },
  { bad: /eontinue/g, good: 'Continue' },
  
  // Fix specific patterns that got broken
  { bad: /'e@/g, good: "'@" },
  { bad: /\{ e/g, good: '{ C' },
  { bad: /, e/g, good: ', C' },
];

// Extensions de fichiers à traiter
const EXTENSIONS = ['.tsx', '.ts', '.js', '.jsx'];

// Compteurs
let filesScanned = 0;
let filesModified = 0;
let totalReplacements = 0;

/**
 * Récursivement scanner un répertoire
 */
function scanDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        scanDirectory(filePath);
      }
    } else if (EXTENSIONS.includes(path.extname(file))) {
      processFile(filePath);
    }
  }
}

/**
 * Traiter un fichier
 */
function processFile(filePath) {
  filesScanned++;
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let replacementCount = 0;

    // Appliquer les corrections
    for (const fix of FIXES) {
      const matches = content.match(fix.bad);
      if (matches) {
        replacementCount += matches.length;
        content = content.replace(fix.bad, fix.good);
      }
    }

    // Si des modifications ont été faites
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesModified++;
      totalReplacements += replacementCount;
      console.log(`? Fixed: ${path.relative(process.cwd(), filePath)} (${replacementCount} fixes)`);
    }
  } catch (error) {
    console.error(`? Error processing ${filePath}: ${error.message}`);
  }
}

/**
 * Main
 */
function main() {
  console.log('='.repeat(60));
  console.log('Repairing broken code files...');
  console.log('='.repeat(60));
  console.log('');

  // Scanner les répertoires
  for (const dir of DIRS_TO_SCAN) {
    const dirName = path.basename(dir);
    console.log(`Scanning ${dirName} directory...`);
    scanDirectory(dir);
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('Summary:');
  console.log(`  Files scanned: ${filesScanned}`);
  console.log(`  Files modified: ${filesModified}`);
  console.log(`  Total fixes: ${totalReplacements}`);
  console.log('='.repeat(60));

  if (filesModified > 0) {
    console.log('\n? Broken code repaired successfully!');
  } else {
    console.log('\n? No broken code found.');
  }
}

main();
