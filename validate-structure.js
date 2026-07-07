import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const lockFilePath = path.join(__dirname, 'structure.lock.json');

if (!fs.existsSync(lockFilePath)) {
  console.error("❌ Error: structure.lock.json not found!");
  process.exit(1);
}

const structureLock = JSON.parse(fs.readFileSync(lockFilePath, 'utf8'));

let violations = 0;

function checkDirectories(dirPath, allowedList, label) {
  if (!fs.existsSync(dirPath)) return;
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!allowedList.includes(item)) {
        console.error(`❌ Structural Violation: Unapproved directory found in ${label} -> "${item}"`);
        violations++;
      }
    }
  }
}

// 1. Check Root
checkDirectories(__dirname, structureLock.allowed_root_directories, 'Root');

// 2. Check Backend
const backendPath = path.join(__dirname, 'backend');
checkDirectories(backendPath, structureLock.allowed_backend_directories, 'Backend');

// 3. Check Frontend Src
const frontendSrcPath = path.join(__dirname, 'frontend', 'src');
checkDirectories(frontendSrcPath, structureLock.allowed_frontend_src_directories, 'Frontend Source');

if (violations > 0) {
  console.error(`\n❌ Validation Failed: ${violations} structural violation(s) detected. Please clean up unapproved directories.`);
  process.exit(1);
} else {
  console.log("✅ Validation Passed: Project structure matches the lock configuration!");
  process.exit(0);
}
