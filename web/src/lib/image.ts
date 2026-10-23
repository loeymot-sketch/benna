// Réduit une photo avant envoi : les photos de téléphone font 3 à 8 Mo, or l'hébergement refuse
// les requêtes > 4,5 Mo. 1800 px de côté suffisent largement pour lire une pochette manuscrite.
export async function shrinkImage(file: File, maxSide = 1800, quality = 0.85): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 1_200_000) { bmp.close?.(); return file; }
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close?.();
    const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', quality));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return file; // navigateur sans createImageBitmap : on envoie tel quel
  }
}
