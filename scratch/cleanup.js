const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The duplicate block starts with '                     <div className="flex-1 bg-[#efeae2]' right after '</section>'
// and ends at the next '</section>'
const targetStart = '      </section>                     <div className="flex-1 bg-[#efeae2]';
const startIndex = content.indexOf(targetStart);

if (startIndex !== -1) {
  console.log('Found duplicate start at index:', startIndex);
  
  // Find the next '</section>' after the start index
  const nextSectionEnd = content.indexOf('      </section>', startIndex + targetStart.length);
  if (nextSectionEnd !== -1) {
    console.log('Found duplicate end at index:', nextSectionEnd);
    
    // We want to keep '      </section>' and remove everything between targetStart's suffix and nextSectionEnd + '</section>'.length
    const prefix = content.substring(0, startIndex + '      </section>'.length);
    const suffix = content.substring(nextSectionEnd + '      </section>'.length);
    
    content = prefix + suffix;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully cleaned up page.tsx!');
  } else {
    console.log('Error: Could not find the end </section> tag.');
  }
} else {
  console.log('Error: Could not find the target duplicate start.');
}
