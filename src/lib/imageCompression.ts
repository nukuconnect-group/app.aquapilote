// Utilitaire de compression d'images côté client
// Compresse les images avant l'upload pour économiser de la bande passante

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 à 1.0
  maxSizeMB?: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  maxSizeMB: 2,
};

/**
 * Compresse une image en réduisant sa taille et/ou sa qualité
 */
export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<{ file: File; compressionRatio: number }> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'));
      
      img.onload = () => {
        try {
          // Calculer les nouvelles dimensions
          let { width, height } = img;
          
          if (opts.maxWidth && width > opts.maxWidth) {
            height = Math.round((height * opts.maxWidth) / width);
            width = opts.maxWidth;
          }
          
          if (opts.maxHeight && height > opts.maxHeight) {
            width = Math.round((width * opts.maxHeight) / height);
            height = opts.maxHeight;
          }
          
          // Créer un canvas pour redimensionner l'image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Impossible de créer le contexte canvas'));
            return;
          }
          
          // Dessiner l'image redimensionnée
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convertir en blob avec compression
          const initialQuality = opts.quality!;
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Erreur lors de la compression'));
                return;
              }
              
              // Si la taille est encore trop grande, réduire la qualité
              const maxSize = (opts.maxSizeMB! * 1024 * 1024);
              
              if (blob.size > maxSize && initialQuality > 0.1) {
                // Réessayer avec une qualité réduite
                const reducedQuality = Math.max(0.1, initialQuality - 0.1);
                canvas.toBlob(
                  (newBlob) => {
                    if (!newBlob) {
                      reject(new Error('Erreur lors de la compression'));
                      return;
                    }
                    
                    const compressedFile = new File([newBlob], file.name, {
                      type: file.type,
                      lastModified: Date.now(),
                    });
                    
                    const compressionRatio = file.size / newBlob.size;
                    
                    console.log(`✅ Image compressée: ${file.size} → ${newBlob.size} octets (${(compressionRatio).toFixed(2)}x)`);
                    
                    resolve({ file: compressedFile, compressionRatio });
                  },
                  file.type,
                  reducedQuality
                );
              } else {
                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });
                
                const compressionRatio = file.size / blob.size;
                
                console.log(`✅ Image compressée: ${file.size} → ${blob.size} octets (${(compressionRatio).toFixed(2)}x)`);
                
                resolve({ file: compressedFile, compressionRatio });
              }
            },
            file.type,
            initialQuality
          );
        } catch (error) {
          reject(error);
        }
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Vérifie si un fichier est une image
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * Formate la taille d'un fichier en lecture humaine
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Compresse plusieurs images en parallèle
 */
export const compressImages = async (
  files: File[],
  options: CompressionOptions = {}
): Promise<Array<{ file: File; compressionRatio: number }>> => {
  const imageFiles = files.filter(isImageFile);
  const otherFiles = files.filter(f => !isImageFile(f)).map(f => ({ 
    file: f, 
    compressionRatio: 1 
  }));
  
  const compressedImages = await Promise.all(
    imageFiles.map(file => compressImage(file, options))
  );
  
  return [...compressedImages, ...otherFiles];
};
