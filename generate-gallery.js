const fs = require('fs');
const path = require('path');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG', '.WEBP']);

function getDimensions(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    // Basic JPEG SOF0/SOF2 marker parser
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] === 0xFF && (buffer[offset + 1] === 0xC0 || buffer[offset + 1] === 0xC2)) {
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        return { width, height };
      }
      offset += 2 + buffer.readUInt16BE(offset + 2);
    }
  } catch (e) {}
  return { width: 0, height: 0 };
}

function generateGalleryData() {
  const directory = __dirname;
  const photosDir = path.join(directory, 'photos');
  const targetDir = fs.existsSync(photosDir) ? photosDir : directory;

  const files = fs.readdirSync(targetDir).filter(file => {
    const ext = path.extname(file);
    return IMAGE_EXTENSIONS.has(ext);
  });

  files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  let vertCount = 0;
  let horizCount = 0;

  const photos = files.map((fileName, index) => {
    let sizeMb = null;
    const fullPath = path.join(targetDir, fileName);
    try {
      const stats = fs.statSync(fullPath);
      const kb = Math.round(stats.size / 1024);
      sizeMb = kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
    } catch (e) {}

    const { width, height } = getDimensions(fullPath);
    const isVertical = height > width;
    const orientation = isVertical ? 'portrait' : 'landscape';
    if (isVertical) vertCount++; else horizCount++;

    const urlPath = targetDir === photosDir ? `photos/${fileName}` : fileName;

    return {
      id: index + 1,
      fileName: fileName,
      url: urlPath,
      title: fileName.replace(/\.[^/.]+$/, ''),
      sizeMb: sizeMb,
      orientation: orientation,
      width: width,
      height: height,
      aspectRatio: `${width}:${height}`
    };
  });

  const galleryConfig = {
    clientName: "Enrico",
    eventTitle: "Batizado do Enrico",
    eventType: "Batizado",
    photographerBrand: "Clique & Poesia",
    brandSubtitle: "Um clique, uma poesia!",
    photographerWhatsapp: "553897569353",
    photographerInstagram = "https://instagram.com/cliqueepoesia",
    welcomeMessage: "Um dia sagrado de bênçãos, luz divina e muito amor eternizados em cada detalhe. Preparamos esta galeria para que você e sua família revivam cada instante com a máxima fidelidade. Todas as fotos foram ajustadas em sua proporção original (verticais e horizontais), prontas para apreciação e download.",
    totalPhotos: photos.length,
    totalVertical: vertCount,
    totalHorizontal: horizCount,
    photos: photos
  };

  const fileContent = `/**
 * Configuração e Lista de Fotos da Galeria - Clique & Poesia
 * Batizado do Enrico
 * Atualizado automaticamente em ${new Date().toLocaleString('pt-BR')}
 */
window.GALLERY_DATA = ${JSON.stringify(galleryConfig, null, 2)};
`;

  fs.writeFileSync(path.join(directory, 'gallery-data.js'), fileContent, 'utf-8');
  console.log(`[OK] gallery-data.js atualizado! Total: ${photos.length} (Verticais: ${vertCount}, Horizontais: ${horizCount})`);
}

generateGalleryData();