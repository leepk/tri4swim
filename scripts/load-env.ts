import fs from 'node:fs'
import path from 'node:path'

function parseEnvLine(line: string): [string, string] | null {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return null
  const match = trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
  if (!match) return null
  let value = match[2].trim()
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1)
  } else {
    value = value.replace(/\s+#.*$/, '').trim()
  }
  value = value.replace(/\\n/g, '\n')
  return [match[1], value]
}

export function loadProjectEnv(cwd = process.cwd()) {
  // Match Next.js precedence closely enough for local scripts: .env.local overrides .env.
  for (const filename of ['.env', '.env.local']) {
    const file = path.join(cwd, filename)
    if (!fs.existsSync(file)) continue
    const content = fs.readFileSync(file, 'utf8')
    for (const line of content.split(/\r?\n/)) {
      const parsed = parseEnvLine(line)
      if (!parsed) continue
      const [key, value] = parsed
      if (filename === '.env.local' || process.env[key] === undefined) process.env[key] = value
    }
  }
}
