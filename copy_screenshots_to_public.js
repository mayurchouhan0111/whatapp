const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'crm_screenshots');
const destDir = path.join(__dirname, 'wacrm', 'public', 'crm_screenshots');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.readdirSync(srcDir).forEach((file) => {
  const srcFile = path.join(srcDir, file);
  const destFile = path.join(destDir, file);
  fs.copyFileSync(srcFile, destFile);
  console.log(`Copied ${file} -> public/crm_screenshots/`);
});

console.log("✅ All 15 screenshots copied to wacrm/public/crm_screenshots/");
