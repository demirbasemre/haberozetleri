const fs = require('fs');

const executionData = JSON.parse(fs.readFileSync('/Users/emre/.gemini/antigravity/brain/31bc0136-f3c9-4df4-8b26-086f020d9990/.system_generated/steps/985/output.txt', 'utf8'));
const ghData = executionData.data.nodes['GitHub SHA Al'].data.output[0][0].json;

const decoded = Buffer.from(ghData.content.replace(/\n/g, ''), 'base64').toString('utf8');
const currentData = JSON.parse(decoded);

const key = "tk:DHL Express UK, Kritik Bakım Ekiplerine Destek Olmak İçin Air Ambulances UK ile |aircargonews";
const action = "edit";

const articles = Array.isArray(currentData) ? currentData : (currentData.articles || []);

function matchesKey(a) {
  if (!key) return false;
  if (key.startsWith('id:')) {
    const idPart = key.slice(3);
    return a.id != null && String(a.id) === idPart;
  }
  if (key.startsWith('tk:')) {
    const rest = key.slice(3);
    const pipeIdx = rest.lastIndexOf('|');
    const titlePart = pipeIdx >= 0 ? rest.slice(0, pipeIdx) : rest;
    const sourcePart = pipeIdx >= 0 ? rest.slice(pipeIdx + 1) : '';
    const aTitle = (a.title || '').trim().slice(0, 80);
    const titleMatch = aTitle === titlePart;
    const sourceMatch = (a.source || '') === sourcePart;
    if (a.title.includes('DHL Express UK') && a.title.includes('Kritik')) {
      console.log("Found candidate article in execution 2946's data.json:");
      console.log("  a.title:", JSON.stringify(a.title));
      console.log("  aTitle :", JSON.stringify(aTitle));
      console.log("  titlePart:", JSON.stringify(titlePart));
      console.log("  titleMatch:", titleMatch);
      console.log("  a.source:", JSON.stringify(a.source));
      console.log("  sourcePart:", JSON.stringify(sourcePart));
      console.log("  sourceMatch:", sourceMatch);
    }
    return titleMatch && sourceMatch;
  }
  return false;
}

const matchCount = articles.filter(matchesKey).length;
console.log("matchCount in execution 2946 content:", matchCount);
