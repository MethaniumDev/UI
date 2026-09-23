export const THEME_ICON_MAX_SIZE = 128;

/**
 * Scales an image down so its longest side fits within
 * THEME_ICON_MAX_SIZE pixels (aspect ratio preserved) and encodes it as a
 * WebP data URL suitable for storing with a theme.
 */
export async function convertThemeIcon(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read the image file."));
    reader.readAsDataURL(file);
  });

  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Could not decode the image file."));
    image.src = dataUrl;
  });

  const sourceWidth = image.naturalWidth || 1;
  const sourceHeight = image.naturalHeight || 1;
  const scale = Math.min(
    1,
    THEME_ICON_MAX_SIZE / Math.max(sourceWidth, sourceHeight),
  );
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas rendering is not supported in this browser.");
  }
  context.drawImage(image, 0, 0, width, height);

  const webp = canvas.toDataURL("image/webp", 0.85);
  if (!webp.startsWith("data:image/webp")) {
    throw new Error("This browser cannot encode WebP images.");
  }
  return webp;
}
