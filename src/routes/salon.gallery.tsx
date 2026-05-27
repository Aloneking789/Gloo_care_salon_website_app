import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
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

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []);
    const next = [...files, ...list].slice(0, MAX);
    if (list.length + files.length > MAX) {
      toast.warning(`Maximum ${MAX} images per upload`);
    }
    setFiles(next);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removePending = (i: number) => setFiles(files.filter((_, idx) => idx !== i));

  return (
    <div>
      <PageHeader title="Gallery" description={`Upload up to ${MAX} images of your salon`} />

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
            className="flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border p-10 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
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
                  className="absolute right-1 top-1 rounded-full bg-background/90 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {files.length < MAX && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex aspect-square items-center justify-center rounded-md border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary"
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
              <div key={i} className="aspect-square overflow-hidden rounded-md border">
                <img src={src} alt={`Salon ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
