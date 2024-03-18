export function hashArray(content: string[]): string {
  // Import as needed. There is also an issue running unit tests in Nx repo if this is a top-level import.
  const { hashArray } = require('../native/import');
  return hashArray(content);
}

export function hashObject(obj: object): string {
  const { hashArray } = require('../native/import');
  const parts: string[] = [];

  for (const key of Object.keys(obj).sort()) {
    parts.push(key);
    parts.push(JSON.stringify(obj[key]));
  }

  return hashArray(parts);
}
