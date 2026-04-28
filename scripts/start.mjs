import { spawn } from 'node:child_process';
import process from 'node:process';

const PORT = process.env.DEPLOY_RUN_PORT || process.env.PORT || '5000';

console.log(`Starting HTTP service on port ${PORT} for deploy...`);

const child = spawn('node', ['dist/server.js'], {
  stdio: 'inherit',
  shell: false,
  env: { ...process.env, PORT },
});

child.on('exit', code => {
  process.exit(code ?? 0);
});
