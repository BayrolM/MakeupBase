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

    // Replace grid-cols-2 with grid-cols-1 md:grid-cols-2
    content = content.replace(/className="([^"]*)grid grid-cols-2([^"]*)"/g, 'className="$1grid grid-cols-1 md:grid-cols-2$2"');
    
    // Replace grid-cols-3 with grid-cols-1 md:grid-cols-3
    content = content.replace(/className="([^"]*)grid grid-cols-3([^"]*)"/g, 'className="$1grid grid-cols-1 md:grid-cols-3$2"');

    // Edge cases where it might use grid-cols-1 md:grid-cols-1 md:grid-cols-2 (if already replaced but we matched grid-cols-2)
    // Actually the regex above only matches EXACTLY `grid grid-cols-2` so if it's `grid grid-cols-1 md:grid-cols-2` it won't match `grid grid-cols-2` because of the `grid-cols-1` in between.
    // Let's make sure: `className="grid grid-cols-2 gap-4"` becomes `className="grid grid-cols-1 md:grid-cols-2 gap-4"`

    if (original !== content) {
      fs.writeFileSync(f, content, 'utf8');
      count++;
      console.log('Updated grids in', f);
    }
  }
});
console.log('Total files updated:', count);
