import { spawn, execSync } from 'node:child_process';
import process from 'node:process';

const PORT = process.env.PORT || '5000';

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

function killPortIfListening(port) {
  if (process.platform === 'win32') {
    try {
      const output = execSync(
        `netstat -ano | findstr :${port}`,
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
      );

      const pids = [...new Set(
        output
          .split(/\r?\n/)
          .map(line => line.trim())
          .filter(Boolean)
          .map(line => line.split(/\s+/).at(-1))
          .filter(Boolean)
      )];

      if (pids.length === 0) {
        console.log(`Port ${port} is free.`);
        return;
      }

      console.log(`Port ${port} in use by PIDs: ${pids.join(', ')}. Killing...`);
      for (const pid of pids) {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
      }
      console.log(`Port ${port} cleared.`);
    } catch {
      console.log(`Port ${port} is free.`);
    }

    return;
  }

  try {
    const output = execSync(`lsof -ti tcp:${port}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();

    if (!output) {
      console.log(`Port ${port} is free.`);
      return;
    }

    const pids = output.split(/\s+/);
    console.log(`Port ${port} in use by PIDs: ${pids.join(', ')}. Killing...`);
    execSync(`kill -9 ${pids.join(' ')}`, { stdio: 'ignore' });
    console.log(`Port ${port} cleared.`);
  } catch {
    console.log(`Port ${port} is free.`);
  }
}

console.log(`Clearing port ${PORT} before start.`);
killPortIfListening(PORT);
console.log(`Starting HTTP service on port ${PORT} for dev...`);

const child = spawnCommand('pnpm', ['tsx', 'watch', 'src/server.ts'], {
  stdio: 'inherit',
  env: { ...process.env, PORT },
});

child.on('exit', code => {
  process.exit(code ?? 0);
});
