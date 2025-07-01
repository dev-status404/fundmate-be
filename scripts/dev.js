import { spawn } from 'child_process';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import notifier from 'node-notifier';
import minimist from 'minimist';
import dotenv from 'dotenv';

// ---------- Load environment variables ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(ROOT_DIR, '.env.development') });
console.log(`Loaded environment from .env.development`);

// Extract only the needed variables
const { PEM_PATH, RDS_ENDPOINT, EC2_HOST, TEAM_LEAD_WEBHOOK_URL } = process.env;
if (!PEM_PATH || !RDS_ENDPOINT || !EC2_HOST) {
  console.error('✖ Missing required environment variables (PEM_PATH, RDS_ENDPOINT, EC2_HOST)');
  process.exit(1);
}

// ---------- Arguments & Configuration ----------
const argv = minimist(process.argv.slice(2), { string: ['service'], alias: { s: 'service' }, default: { service: 'ai-service' } });
const SERVICE_NAME = argv.service;
const API_GATEWAY = 'api-gateway';
const IDLE_PERIOD = 1000 * 60 * 60 * 2; // 2 hours

// ---------- Helper Functions ----------
const procs = [];
function log(name, message) {
  process.stdout.write(`[${name}] ${message}`);
}

function run(name, cmd, args, extraEnv = {}) {
  const env = { PEM_PATH, RDS_ENDPOINT, EC2_HOST, TEAM_LEAD_WEBHOOK_URL, ...process.env, ...extraEnv };
  log(name, `Spawning: ${cmd} ${args.join(' ')}\n`);
  const proc = spawn(cmd, args, { shell: true, cwd: ROOT_DIR, env });
  proc.stdout.on('data', (d) => {
    log(name, d);
    resetTimer();
  });
  proc.stderr.on('data', (d) => {
    log(name, d);
    resetTimer();
  });
  proc.on('exit', (code, sig) => log(name, `Exited code=${code} sig=${sig}\n`));
  procs.push(proc);
  return proc;
}

// ---------- SSH Tunnel ----------
function startSsh() {
  // Debug log for env values
  console.log(`[SSH DEBUG] PEM_PATH=${PEM_PATH}, RDS_ENDPOINT=${RDS_ENDPOINT}, EC2_HOST=${EC2_HOST}`);

  const localPort = '3306';
  const forwarding = `${localPort}:${RDS_ENDPOINT}:3306`;

  // Build SSH command with identity-only flag to avoid wrong key selection
  const sshCmd = os.platform() === 'win32' ? 'ssh.exe' : 'ssh';
  const sshArgs = ['-o', 'IdentitiesOnly=yes', '-o', 'StrictHostKeyChecking=no', '-i', PEM_PATH, '-L', forwarding, `ubuntu@${EC2_HOST}`, '-N'];

  const sshProc = run('SSH', sshCmd, sshArgs);
  sshProc.on('exit', (code) => {
    if (code !== 0) {
      shutdownAll();
    }
  });

  return sshProc;
}

// ---------- NX Servers ----------
function startNx() {
  run('GATEWAY', 'nx', ['serve', API_GATEWAY]);
  run('SERVICE', 'nx', ['serve', SERVICE_NAME]);
}

// ---------- Idle Handling ----------
let idleTimer;
function resetTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(onIdle, IDLE_PERIOD);
}

function onIdle() {
  log('Idle', `No output for ${IDLE_PERIOD / 3600000}h\n`);
  if (TEAM_LEAD_WEBHOOK_URL) {
    fetch(TEAM_LEAD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: `No traffic on ${SERVICE_NAME}&${API_GATEWAY} for 2h` }),
    });
  }
  notifier.notify({ title: 'Idle Timeout', message: 'Continue services?', wait: true, timeout: 10 }, (err, resp, meta) => {
    if (err || resp === 'no' || meta.activationValue === 'timeout') shutdownAll();
    else resetTimer();
  });
}

// ---------- Shutdown ----------
function shutdownAll() {
  procs.forEach((p) => p.kill('SIGTERM'));
  setTimeout(() => process.exit(0), 500);
}
process.on('SIGINT', shutdownAll);
process.on('SIGTERM', shutdownAll);

// ---------- Main ----------
async function main() {
  console.log(`ROOT_DIR: ${ROOT_DIR}`);
  startSsh();
  // Wait 3 seconds for SSH tunnel to establish
  await new Promise((res) => setTimeout(res, 3000));
  // Verify TCP port 3306 is open on localhost
  {
    const { connect } = await import('net');
    try {
      await new Promise((resolve, reject) => {
        const socket = connect({ host: '127.0.0.1', port: 3306 }, () => {
          socket.end();
          resolve();
        });
        socket.on('error', (err) => reject(err));
      });
    } catch (err) {
      console.error('[SSH] Port 3306 is not open, shutting down', err);
      shutdownAll();
      return;
    }
    console.log('[SSH] Port 3306 is open, starting services');
    startNx();
    resetTimer();
  }
}

main();
