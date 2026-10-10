export async function hasValidImageSignature(file: File): Promise<boolean> {
  const b = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const starts = (...v: number[]) => v.every((x, i) => b[i] === x);
  if (file.type === "image/jpeg") return starts(0xff, 0xd8, 0xff);
  if (file.type === "image/png") return starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
  const ascii = (start: number, text: string) => [...text].every((c, i) => b[start + i] === c.charCodeAt(0));
  if (file.type === "image/webp") return ascii(0, "RIFF") && ascii(8, "WEBP");
  if (file.type === "image/gif") return ascii(0, "GIF87a") || ascii(0, "GIF89a");
  return false;
}
