const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname,'..');
const ctx={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'data.js'),'utf8'),ctx);
const data=ctx.window.STUDY_DATA;
test('curriculum covers all eleven technical and management domains',()=>{
  assert.equal(data.domains.length,11);
  assert.ok(data.questions.length>=120);
  for(const d of data.domains)assert.ok(data.questions.filter(q=>q.domain===d.id).length>=8,d.id);
  assert.ok(data.questions.filter(q=>q.domain==='linux').length>=15);
  assert.ok(data.questions.filter(q=>q.domain==='networking').length>=15);
});
test('questions have stable unique IDs, valid answers, and usable feedback',()=>{
  assert.equal(new Set(data.questions.map(q=>q.id)).size,data.questions.length);
  for(const q of data.questions){
    assert.ok(data.domains.some(d=>d.id===q.domain),q.id);
    assert.equal(q.choices.length,4,q.id);
    assert.equal(new Set(q.choices).size,4,q.id);
    assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4,q.id);
    assert.ok(q.prompt.length>12&&q.explanation.length>40&&q.memory.length>5,q.id);
    assert.ok(['Foundation','Applied','Advanced'].includes(q.difficulty),q.id);
  }
});
test('technical references link to HTTPS primary sources',()=>{
  assert.ok(data.sources.length>=8);
  for(const source of data.sources){assert.ok(source.title);assert.equal(new URL(source.url).protocol,'https:');}
});
test('every local script and stylesheet referenced by the entrypoint exists',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  for(const m of html.matchAll(/(?:src|href)="\.\/([^"#]+)"/g))assert.ok(fs.existsSync(path.join(root,m[1])),m[1]);
  for(const file of ['app.js','data.js','linux.js','scenarios.js'])new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});
});
