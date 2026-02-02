#!/usr/bin/env bun

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

function transformText(input: string): string {
   let output = input
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '');

   const tagRegex = /<([/!]?\s*[-\w:]+)[^>]*>/g;

   output = output.replace(tagRegex, (_match, tagName) => {
      const cleanedName = String(tagName).trim().replace(/\s+/g, ' ');
      return `<${cleanedName}>`;
   });

   return output;
}

async function main() {
   const [, , fileArg] = process.argv;

   if (!fileArg) {
      console.error(
         'Usage: bun run scripts/strip-attributes.ts <file-path>',
      );
      process.exit(1);
   }

   const filePath = resolve(process.cwd(), fileArg);

   let original: string;
   try {
      original = await readFile(filePath, 'utf8');
   } catch (err) {
      console.error(`Failed to read file: ${filePath}`);
      console.error(err);
      process.exit(1);
   }

   const transformed = transformText(original);

   if (transformed === original) {
      // No changes – still write if you prefer, but usually no-op is fine
      console.log('No changes made.');
      return;
   }

   try {
      await writeFile(filePath, transformed, 'utf8');
      console.log(`Updated file: ${filePath}`);
   } catch (err) {
      console.error(`Failed to write file: ${filePath}`);
      console.error(err);
      process.exit(1);
   }
}

main().catch((err) => {
   console.error(err);
   process.exit(1);
});
