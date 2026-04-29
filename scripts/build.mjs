import { spawn } from 'node:child_process';
import process from 'node:process';

function spawnCommand(command, args, options = {}) {
  if (process.platform === 'win32') {
    return spawn('cmd.exe', ['/c', command, ...args], {
      ...options,
      shell: false,
    });
  }

  return spawn(command, args, {
    ...options,
    shell: false,
  });
}


function run(command, args, label) {
  return new Promise((resolve, reject) => {
    console.log(label);

    const child = spawnCommand(command, args, {
      stdio: 'inherit',
      env: process.env,
    });

    child.on('exit', code => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}`));
    });
  });
}

await run(
  'pnpm',
  ['install', '--prefer-frozen-lockfile', '--prefer-offline', '--loglevel', 'debug', '--reporter=append-only'],
  'Installing dependencies...'
);

await run('pnpm', ['next', 'build'], 'Building the Next.js project...');

await run(
  'pnpm',
  [
    'tsup',
    'src/server.ts',
    '--format',
    'cjs',
    '--platform',
    'node',
    '--target',
    'node20',
    '--outDir',
    'dist',
    '--no-splitting',
    '--no-minify',
  ],
  'Bundling server with tsup...'
);

console.log('Build completed successfully!');
