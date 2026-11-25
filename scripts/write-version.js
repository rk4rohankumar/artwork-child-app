// Writes build/version.json so the host shell can show which commit each
// remote is running and when it was built: proof the apps deploy on their own.
const fs = require('fs');
const { execSync } = require('child_process');

let commit = process.env.VERCEL_GIT_COMMIT_SHA;
if (!commit) {
  try {
    commit = execSync('git rev-parse HEAD').toString().trim();
  } catch {
    commit = 'unknown';
  }
}
fs.writeFileSync('build/version.json', JSON.stringify({ commit, builtAt: new Date().toISOString() }));
