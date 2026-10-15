import fs from 'node:fs/promises';
const raw = await fs.readFile('reference/desktop.html', 'utf8');
const lines = raw.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].replace(/data:([^;]+);base64,[^"'\s)]*/g, 'data:$1;base64,[EMBEDDED_ASSET]');
  if (line.length > 350) console.log(`${i + 1}: ${line.slice(0, 350)}...`);
  else if (/setTimeout|setInterval|addEventListener|function |const scenes|const steps|<audio|<video|<img|<button|<canvas|<a |<script|<style|\bid=|data-shop|src=|href=|animation:|@keyframes/.test(line)) console.log(`${i + 1}: ${line}`);
}
