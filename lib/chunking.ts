const CHUNK_SIZE = 800;
const OVERLAP = 100;

export function chunkText(text: string): string[] {
  const cleanedText = text.replace(/\s+/g, ' ').trim();
  
  if (cleanedText.length <= CHUNK_SIZE) {
    return [cleanedText];
  }

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < cleanedText.length) {
    let endIndex = Math.min(startIndex + CHUNK_SIZE, cleanedText.length);

    if (endIndex < cleanedText.length) {
      const lastSpaceIndex = cleanedText.lastIndexOf(' ', endIndex);
      if (lastSpaceIndex > startIndex) {
        endIndex = lastSpaceIndex;
      }
    }

    const chunk = cleanedText.slice(startIndex, endIndex).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    startIndex = endIndex - OVERLAP;
    if (startIndex <= 0) {
      startIndex = endIndex;
    }
  }

  return chunks;
}
