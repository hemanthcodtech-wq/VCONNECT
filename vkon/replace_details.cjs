const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const oldAddress = 'Aspari main road opposite APGB Bank, 518347';
const newAddress = '10-34 Malkapur X road, Sangareddy-502001';

const oldPhone = '+91 98660 48155';
const newPhone = '+91 88860 00847';

const oldPhonePlain = '919866048155';
const newPhonePlain = '918886000847';

const oldEmail = 'mani.worriers@gmail.com';
const newEmail = '';

const walkSync = function(dir, filelist) {
  let files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      if (file.endsWith('.jsx') || file.endsWith('.js')) {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
};

const files = walkSync(directoryPath);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  content = content.replace(new RegExp(oldAddress.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newAddress);
  content = content.replace(new RegExp(oldPhone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newPhone);
  content = content.replace(new RegExp(oldPhonePlain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newPhonePlain);
  
  // Custom replacement for email because it might have a "mailto:" prefix that looks bad if it's empty
  content = content.replace(/mailto:mani\.worriers@gmail\.com/g, '#');
  content = content.replace(new RegExp(oldEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newEmail);
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
