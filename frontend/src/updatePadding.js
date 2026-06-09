const fs = require('fs');
const path = require('path');
const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walkSync(filepath, filelist);
    } else {
      filelist.push(filepath);
    }
  });
  return filelist;
};

const files = walkSync('c:/Users/graci/Documents/Makeup Base/FIGMA/MakeupBase/frontend/src/components/modules');
let count = 0;
files.forEach(f => {
  if (f.endsWith('.tsx')) {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;
    // We replace px-8 with px-4 md:px-8
    content = content.replace(/className="([^"]*)px-8([^"]*)"/g, 'className="$1px-4 md:px-8$2"');
    // We replace px-6 with px-4 md:px-6
    content = content.replace(/className="([^"]*)px-6([^"]*)"/g, 'className="$1px-4 md:px-6$2"');
    // We replace pt-8 with pt-6 md:pt-8
    content = content.replace(/className="([^"]*)pt-8([^"]*)"/g, 'className="$1pt-6 md:pt-8$2"');
    if (original !== content) {
      fs.writeFileSync(f, content, 'utf8');
      count++;
      console.log('Updated', f);
    }
  }
});
console.log('Total files updated:', count);
