import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  File, 
  Trash2, 
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useOfflineFileUpload } from '@/hooks/useOfflineFileUpload';
import { formatFileSize } from '@/lib/imageCompression';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FileUploadManagerProps {
  module: string;
  moduleLabel: string;
  acceptedTypes?: string;
  maxFiles?: number;
}

export const FileUploadManager: React.FC<FileUploadManagerProps> = ({
  module,
  moduleLabel,
  acceptedTypes = 'image/*,.pdf,.csv,.xlsx',
  maxFiles = 10,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const { 
    uploadFiles, 
    deleteFile, 
    getModuleFiles, 
    isUploading, 
    uploadProgress,
    isOnline 
  } = useOfflineFileUpload();

  // Charger les fichiers existants
  useEffect(() => {
    loadFiles();
  }, [module]);

  const loadFiles = async () => {
    const files = await getModuleFiles(module);
    setUploadedFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + selectedFiles.length > maxFiles) {
      alert(`Vous ne pouvez sélectionner que ${maxFiles} fichiers maximum`);
      return;
    }
    
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleRemoveSelected = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    const results = await uploadFiles(selectedFiles, {
      module,
      compress: true,
      metadata: {
        uploadedAt: new Date().toISOString(),
      },
    });

    if (results.length > 0) {
      setSelectedFiles([]);
      await loadFiles();
    }
  };

  const handleDelete = async (filePath: string, fileId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      const success = await deleteFile(filePath, fileId);
      if (success) {
        await loadFiles();
      }
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Zone d'upload */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
            Upload de fichiers - {moduleLabel}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {isOnline 
              ? 'Les fichiers seront uploadés immédiatement avec compression automatique'
              : '📱 Mode hors ligne : les fichiers seront synchronisés plus tard'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Bouton de sélection */}
          <div className="border-2 border-dashed border-border rounded-lg p-6 sm:p-8 text-center hover:border-primary transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedTypes}
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm sm:text-base font-medium mb-2">
              Cliquez pour sélectionner des fichiers
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              Maximum {maxFiles} fichiers • Images compressées automatiquement
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-xs sm:text-sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Sélectionner des fichiers
            </Button>
          </div>

          {/* Fichiers sélectionnés */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm sm:text-base font-medium">
                  Fichiers sélectionnés ({selectedFiles.length})
                </h4>
                <Badge variant="secondary" className="text-xs sm:text-sm">
                  {formatFileSize(totalSize)}
                </Badge>
              </div>
              
              <ScrollArea className="max-h-60 border rounded-lg p-3">
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {getFileIcon(file.type)}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-medium truncate">
                            {file.name}
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveSelected(index)}
                        disabled={isUploading}
                        className="h-7 w-7 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Barre de progression */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span>Upload en cours...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1 text-xs sm:text-sm"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Upload...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Uploader {selectedFiles.length} fichier(s)
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedFiles([])}
                  disabled={isUploading}
                  className="text-xs sm:text-sm"
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des fichiers uploadés */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">
            Fichiers uploadés ({uploadedFiles.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {uploadedFiles.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm sm:text-base text-muted-foreground">
                Aucun fichier uploadé pour ce module
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-96">
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        {getFileIcon(file.file_type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium truncate">
                          {file.file_name}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
                          <span>{formatFileSize(file.file_size)}</span>
                          {file.compressed_size && file.compressed_size !== file.file_size && (
                            <Badge variant="secondary" className="text-[10px]">
                              Compressé: {formatFileSize(file.compressed_size)}
                            </Badge>
                          )}
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(file.created_at), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {file.public_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          asChild
                          className="h-7 w-7 p-0"
                        >
                          <a href={file.public_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(file.file_path, file.id)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Info sur la compression */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-sm sm:text-base mb-2">
                💡 Compression automatique activée
              </h4>
              <ul className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                <li className="break-words">
                  • Les images sont automatiquement compressées avant l'upload
                </li>
                <li className="break-words">
                  • Qualité optimale maintenue (80%) avec réduction de taille
                </li>
                <li className="break-words">
                  • Économie de bande passante et d'espace de stockage
                </li>
                <li className="break-words">
                  • Synchronisation automatique en mode hors ligne
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUploadManager;
