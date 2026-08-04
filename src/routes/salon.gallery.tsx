import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/salon/gallery')({
  component: GalleryPage,
});

const MAX = 5;

function GalleryPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['profile'], queryFn: api.profile });
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentCount = data?.images?.length ?? 0;

  const upload = useMutation({
    mutationFn: () => api.uploadProfileImages(files),
    onSuccess: () => {
      toast.success('Gallery updated');
      setFiles([]);
      qc.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (e: Error) => {
      if ((e as any)?.message?.toLowerCase?.().includes('session expired') || (e as any)?.status === 401) return;
      toast.error(e.message);
    },
  });

  const deleteImg = useMutation({
    mutationFn: (imageUrl: string) => api.deleteProfileImage(imageUrl),
    onSuccess: () => {
      toast.success('Image deleted');
      qc.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (e: Error) => {
      if ((e as any)?.message?.toLowerCase?.().includes('session expired') || (e as any)?.status === 401) return;
      toast.error(e.message);
    },
  });

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []);
    const allowed = MAX - currentCount - files.length;
    if (allowed <= 0) {
      toast.warning(`Maximum limit of ${MAX} images reached`);
      return;
    }
    const nextList = list.slice(0, allowed);
    if (list.length > allowed) {
      toast.warning(`You can only select up to ${allowed} more image${allowed > 1 ? 's' : ''}`);
    }
    setFiles([...files, ...nextList]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removePending = (i: number) => setFiles(files.filter((_, idx) => idx !== i));

  return (
    <div>
      <PageHeader title="Gallery" description={`Upload up to ${MAX} images of your salon`} />

      {currentCount >= MAX ? (
        <div className="mb-8 rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          Maximum limit of {MAX} gallery images reached. Delete existing images below to upload new ones.
        </div>
      ) : (
        <div className="mb-8 rounded-lg border bg-card p-4">
          <div className="mb-3 text-sm font-medium">New upload</div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onPick}
          />

          {files.length === 0 ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border p-10 text-muted-foreground transition-colors hover:border-primary hover:text-primary cursor-pointer"
            >
              <Upload className="h-6 w-6" />
              <span className="text-sm">Click to select images</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {files.map((f, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-md border">
                  <img src={URL.createObjectURL(f)} alt={f.name} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePending(i)}
                    className="absolute right-1 top-1 rounded-full bg-background/90 p-1 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                    aria-label="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {currentCount + files.length < MAX && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex aspect-square items-center justify-center rounded-md border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary cursor-pointer"
                >
                  <Upload className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {files.length > 0 && (
            <div className="mt-4 flex gap-2">
              <Button onClick={() => upload.mutate()} disabled={upload.isPending}>
                {upload.isPending ? 'Uploading...' : `Upload ${files.length} image${files.length > 1 ? 's' : ''}`}
              </Button>
              <Button variant="outline" onClick={() => setFiles([])} disabled={upload.isPending}>
                Clear
              </Button>
            </div>
          )}
        </div>
      )}

      <div>
        <div className="mb-3 text-sm font-medium">Current gallery</div>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="aspect-square w-full" />)}
          </div>
        ) : !data?.images?.length ? (
          <p className="text-sm text-muted-foreground">No images yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {data.images.map((src, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-md border bg-muted">
                <img 
                  src={src} 
                  alt={`Salon ${i + 1}`} 
                  className="h-full w-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300" 
                  loading="lazy" 
                  onClick={() => setSelectedImage(src)}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Delete this image from gallery?')) {
                      deleteImg.mutate(src);
                    }
                  }}
                  disabled={deleteImg.isPending}
                  className="absolute right-1 top-1 rounded-full bg-background/90 p-1.5 opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50 hover:bg-destructive hover:text-destructive-foreground shadow-sm cursor-pointer"
                  aria-label="Delete image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 sm:p-6"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white hover:text-primary transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full cursor-pointer z-50"
            onClick={() => setSelectedImage(null)}
            aria-label="Close full view"
          >
            <X className="h-5 w-5" />
          </button>
          <img 
            src={selectedImage} 
            alt="Salon gallery item full view" 
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl transition-transform duration-300 animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
