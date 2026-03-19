#!/usr/bin/env node

const { spawn } = require('child_process')
const path = require('path')

console.log('[v0] Generating Prisma client...')

const prisma = spawn('npx', ['prisma', 'generate'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: true
})

prisma.on('close', (code) => {
  if (code === 0) {
    console.log('[v0] Prisma client generated successfully!')
    process.exit(0)
  } else {
    console.error('[v0] Error generating Prisma client (code: ' + code + ')')
    process.exit(1)
  }
})

prisma.on('error', (error) => {
  console.error('[v0] Error spawning Prisma process:', error)
  process.exit(1)
})
