const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  if (filePath.includes('login') || filePath.includes('register') || filePath.includes('LandingClient') || filePath.includes('SquaresBackground')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  content = content.replace(/#0e1322/gi, '#09090b');
  content = content.replace(/#adc6ff/gi, '#10b981');
  content = content.replace(/#002e6a/gi, '#000000');
  content = content.replace(/#dee1f7/gi, '#f4f4f5');
  content = content.replace(/#c2c6d6/gi, '#d4d4d8');
  content = content.replace(/#8c909f/gi, '#71717a');
  content = content.replace(/#25293a/gi, '#18181b');
  content = content.replace(/#161b2b/gi, '#18181b');
  content = content.replace(/#424754/gi, '#27272a');
  content = content.replace(/#4d8eff/gi, '#10b981');
  
  content = content.replace(/rgba\(26,31,47,/g, 'rgba(24,24,27,');
  content = content.replace(/rgba\(26, 31, 47,/g, 'rgba(24, 24, 27,');
  content = content.replace(/rgba\(66,71,84,/g, 'rgba(39,39,42,');
  content = content.replace(/rgba\(66, 71, 84,/g, 'rgba(39, 39, 42,');
  content = content.replace(/rgba\(77,142,255,/g, 'rgba(16,185,129,');
  content = content.replace(/rgba\(173,198,255,/g, 'rgba(16,185,129,');
  
  content = content.replace(/bg-\[#0e1322\]/g, 'bg-zinc-950');
  content = content.replace(/bg-\[#adc6ff\]/g, 'bg-emerald-500');
  content = content.replace(/text-\[#adc6ff\]/g, 'text-emerald-500');
  content = content.replace(/text-\[#dee1f7\]/g, 'text-zinc-100');
  content = content.replace(/border-\[#adc6ff\]/g, 'border-emerald-500');
  
  content = content.replace(/fontFamily:'Syne'/g, "fontFamily:'Inter'");
  content = content.replace(/fontFamily: 'Syne'/g, "fontFamily: 'Inter'");
  content = content.replace(/fontFamily:'Manrope'/g, "fontFamily:'Inter'");
  content = content.replace(/fontFamily: 'Manrope'/g, "fontFamily: 'Inter'");
  content = content.replace(/Syne, sans-serif/g, 'Inter, sans-serif');
  content = content.replace(/Manrope, sans-serif/g, 'Inter, sans-serif');
  
  content = content.replace(/borderRadius:'24px'/g, "borderRadius:'8px'");
  content = content.replace(/borderRadius: '24px'/g, "borderRadius: '8px'");
  content = content.replace(/borderRadius:'20px'/g, "borderRadius:'6px'");
  content = content.replace(/borderRadius: '20px'/g, "borderRadius: '6px'");
  content = content.replace(/borderRadius:'16px'/g, "borderRadius:'6px'");
  content = content.replace(/borderRadius: '16px'/g, "borderRadius: '6px'");
  content = content.replace(/borderRadius:'12px'/g, "borderRadius:'4px'");
  content = content.replace(/borderRadius: '12px'/g, "borderRadius: '4px'");
  content = content.replace(/borderRadius:'10px'/g, "borderRadius:'4px'");
  content = content.replace(/borderRadius: '10px'/g, "borderRadius: '4px'");
  content = content.replace(/borderRadius:'8px'/g, "borderRadius:'4px'");
  content = content.replace(/borderRadius: '8px'/g, "borderRadius: '4px'");
  
  content = content.replace(/rounded-2xl/g, 'rounded-md');
  content = content.replace(/rounded-xl/g, 'rounded-md');
  content = content.replace(/rounded-lg/g, 'rounded-sm');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Updated: ' + filePath);
  }
}

console.log('Starting mass theme replacement...');
walk('./app', processFile);
walk('./components', processFile);
console.log('Mass theme replacement complete.');
