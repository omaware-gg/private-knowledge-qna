/**
 * Recursive text splitter for RAG chunking.
 *
 * Tries to split on the most semantically meaningful boundary first
 * (paragraphs → sentences → clauses → words → characters), falling back
 * to finer-grained separators only when a section exceeds the max size.
 *
 * text-embedding-3-small context window: 8191 tokens (~32 000 chars).
 * For retrieval quality we target ~1000 tokens per chunk (~4000 chars).
 */

// Separators ordered from coarsest to finest boundary
const SEPARATORS = [
  '\n\n',   // paragraph break
  '\n',     // line break
  '. ',     // sentence end
  '! ',     // exclamation
  '? ',     // question
  '; ',     // clause
  ', ',     // comma clause
  ' ',      // word
  '',       // character (last resort)
];

// text-embedding-3-small max input: 8191 tokens ≈ 32 000 chars.
// We use 4000 chars (~1000 tokens) for good retrieval quality and safe margin.
const MAX_CHUNK_CHARS = 4000;
const CHUNK_OVERLAP = 200;

export interface ChunkingOptions {
  maxChunkChars?: number;
  overlap?: number;
}

/**
 * Split `text` into chunks using a recursive strategy.
 *
 * 1.  Try the coarsest separator that produces sections.
 * 2.  Merge consecutive small sections into chunks up to maxChunkChars.
 * 3.  If any section is still too large, recurse with the next-finer separator.
 */
export function chunkText(
  text: string,
  options?: ChunkingOptions,
): string[] {
  const maxChunkChars = options?.maxChunkChars ?? MAX_CHUNK_CHARS;
  const overlap = options?.overlap ?? CHUNK_OVERLAP;

  const trimmed = text.trim();
  if (trimmed.length === 0) return [];
  if (trimmed.length <= maxChunkChars) return [trimmed];

  return recursiveSplit(trimmed, SEPARATORS, maxChunkChars, overlap);
}

function recursiveSplit(
  text: string,
  separators: string[],
  maxChunkChars: number,
  overlap: number,
): string[] {
  if (text.length <= maxChunkChars) return [text];

  // Pick the first separator that actually appears in the text
  let chosenSep = '';
  let remainingSeparators = separators;

  for (let i = 0; i < separators.length; i++) {
    const sep = separators[i];
    if (sep === '' || text.includes(sep)) {
      chosenSep = sep;
      remainingSeparators = separators.slice(i + 1);
      break;
    }
  }

  // Split on the chosen separator
  const rawSections = chosenSep === ''
    ? text.split('')          // character-level (last resort)
    : text.split(chosenSep);

  // Merge small sections into chunks, keeping them under maxChunkChars
  const chunks: string[] = [];
  let currentParts: string[] = [];
  let currentLen = 0;

  for (const section of rawSections) {
    const piece = section.trim();
    if (piece.length === 0) continue;

    // If this single piece exceeds the limit, recurse with a finer separator
    if (piece.length > maxChunkChars) {
      // Flush what we have so far
      if (currentParts.length > 0) {
        chunks.push(currentParts.join(chosenSep === '' ? '' : chosenSep));
        currentParts = [];
        currentLen = 0;
      }
      const subChunks = recursiveSplit(piece, remainingSeparators, maxChunkChars, overlap);
      chunks.push(...subChunks);
      continue;
    }

    const sepLen = chosenSep === '' ? 0 : chosenSep.length;
    const addedLen = currentLen === 0 ? piece.length : sepLen + piece.length;

    if (currentLen + addedLen > maxChunkChars && currentParts.length > 0) {
      // Flush current chunk
      chunks.push(currentParts.join(chosenSep === '' ? '' : chosenSep));

      // Overlap: keep trailing parts that fit within the overlap budget
      const overlapParts: string[] = [];
      let overlapLen = 0;
      for (let j = currentParts.length - 1; j >= 0; j--) {
        const partLen = currentParts[j].length + (overlapParts.length > 0 ? sepLen : 0);
        if (overlapLen + partLen > overlap) break;
        overlapParts.unshift(currentParts[j]);
        overlapLen += partLen;
      }
      currentParts = overlapParts;
      currentLen = overlapLen;
    }

    currentParts.push(piece);
    currentLen += addedLen;
  }

  // Flush remaining
  if (currentParts.length > 0) {
    const last = currentParts.join(chosenSep === '' ? '' : chosenSep);
    if (last.trim().length > 0) {
      chunks.push(last);
    }
  }

  return chunks;
}
