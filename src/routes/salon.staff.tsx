import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { BarberData, CreateBarberRequest } from '@/lib/types';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Phone, 
  Briefcase, 
  X, 
  AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/salon/staff')({
  component: StaffPage,
});

const emptyForm: CreateBarberRequest = {
  name: '',
  specialty: [],
  experience: '',
  image: '',
  mobileNo: '',
};

function StaffPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ['barbers'], queryFn: api.barbers });
  
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<BarberData | null>(null);
  const [deletingBarber, setDeletingBarber] = useState<BarberData | null>(null);
  const [formData, setFormData] = useState<CreateBarberRequest>(emptyForm);
  const [specialtyInput, setSpecialtyInput] = useState('');

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingBarber) {
        return api.updateBarber(editingBarber.id, formData);
      }
      return api.createBarber(formData);
    },
    onSuccess: () => {
      toast.success(editingBarber ? 'Staff member updated' : 'Staff member added');
      qc.invalidateQueries({ queryKey: ['barbers'] });
      handleCloseModal();
    },
    onError: (e: Error) => {
      if ((e as any)?.message?.toLowerCase?.().includes('session expired') || (e as any)?.status === 401) return;
      toast.error(e.message || 'An error occurred');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteBarber(id),
    onSuccess: () => {
      toast.success('Staff member removed');
      qc.invalidateQueries({ queryKey: ['barbers'] });
      setDeleteOpen(false);
      setDeletingBarber(null);
    },
    onError: (e: Error) => {
      if ((e as any)?.message?.toLowerCase?.().includes('session expired') || (e as any)?.status === 401) return;
      toast.error(e.message || 'Failed to remove staff');
    },
  });

  const handleOpenCreate = () => {
    setEditingBarber(null);
    setFormData(emptyForm);
    setSpecialtyInput('');
    setModalOpen(true);
  };

  const handleOpenEdit = (barber: BarberData) => {
    setEditingBarber(barber);
    setFormData({
      name: barber.name,
      specialty: barber.specialty ? [...barber.specialty] : [],
      experience: barber.experience,
      image: barber.imageUrl || '',
      mobileNo: barber.mobileNo,
    });
    setSpecialtyInput('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingBarber(null);
    setFormData(emptyForm);
    setSpecialtyInput('');
  };

  const handleAddSpecialty = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = specialtyInput.trim();
    if (trimmed && !formData.specialty.includes(trimmed)) {
      setFormData({
        ...formData,
        specialty: [...formData.specialty, trimmed],
      });
      setSpecialtyInput('');
    }
  };

  const handleRemoveSpecialty = (spec: string) => {
    setFormData({
      ...formData,
      specialty: formData.specialty.filter((s) => s !== spec),
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter staff name');
      return;
    }
    if (formData.specialty.length === 0) {
      toast.error('Please add at least one specialty');
      return;
    }
    if (!formData.mobileNo.trim()) {
      toast.error('Please enter mobile number');
      return;
    }
    if (!formData.experience.trim()) {
      toast.error('Please enter experience');
      return;
    }
    saveMutation.mutate();
  };

  const handleOpenDelete = (barber: BarberData) => {
    setDeletingBarber(barber);
    setDeleteOpen(true);
  };

  const getInitials = (name: string) => {
    return name ? name.trim().charAt(0).toUpperCase() : 'S';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff"
        description="Manage your barbers and stylists"
        actions={
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add staff
          </Button>
        }
      />

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {(error as Error).message}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-xl bg-muted/20">
          <p className="text-sm font-medium text-muted-foreground">No staff members yet.</p>
          <p className="text-xs text-muted-foreground/80 mt-1 mb-4">Start by adding your first staff member.</p>
          <Button onClick={handleOpenCreate}>Add First Staff</Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((barber) => (
            <Card key={barber.id} className="relative overflow-hidden group transition-all duration-300 hover:border-primary/20 hover:shadow-md">
              {/* Delete trash button on top-right */}
              <button
                type="button"
                onClick={() => handleOpenDelete(barber)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-background/80 border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shadow-xs cursor-pointer animate-in fade-in zoom-in duration-200"
                aria-label="Delete staff"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                <div className="flex items-start gap-4">
                  {/* First letter as profile logo */}
                  <div className="h-14 w-14 shrink-0 flex items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/80 text-primary-foreground font-bold text-xl border border-primary/20 shadow-inner select-none">
                    {getInitials(barber.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-lg text-foreground truncate">{barber.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                      <Briefcase className="h-3.5 w-3.5" />
                      <span>{barber.experience}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Specialties</span>
                  <div className="flex flex-wrap gap-1.5">
                    {barber.specialty?.map((spec, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary capitalize"
                      >
                        {spec}
                      </span>
                    )) ?? <span className="text-xs text-muted-foreground">—</span>}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-border/50">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 text-xs h-8 cursor-pointer"
                    asChild
                  >
                    <a href={`tel:${barber.mobileNo}`}>
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      Call
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 text-xs h-8 cursor-pointer"
                    onClick={() => handleOpenEdit(barber)}
                  >
                    <Pencil className="h-3.5 w-3.5 text-primary" />
                    Edit
                  </Button>
                  {/* <Button
                    size="sm"
                    className="flex-1 text-xs h-8 cursor-pointer"
                    onClick={() => console.log('Assign jobs to', barber.id)}
                  >
                    Assign Jobs
                  </Button> */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Staff Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBarber ? 'Edit Staff Member' : 'Add New Staff'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Amit Kumar"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="specialty">Specialties *</Label>
              <form onSubmit={handleAddSpecialty} className="flex gap-2">
                <Input
                  id="specialty"
                  placeholder="e.g. haircut, shave, color"
                  value={specialtyInput}
                  onChange={(e) => setSpecialtyInput(e.target.value)}
                />
                <Button type="button" size="sm" onClick={() => handleAddSpecialty()}>
                  Add
                </Button>
              </form>
              
              {formData.specialty.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 p-2 border rounded-md bg-muted/20">
                  {formData.specialty.map((spec, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                    >
                      {spec}
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecialty(spec)}
                        className="text-primary hover:text-primary-foreground hover:bg-primary rounded-full p-0.5 transition-colors cursor-pointer"
                        aria-label={`Remove ${spec}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mobile">Mobile *</Label>
              <Input
                id="mobile"
                placeholder="e.g. 9876543210"
                value={formData.mobileNo}
                onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="experience">Experience *</Label>
              <Input
                id="experience"
                placeholder="e.g. 5 years"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="flex sm:justify-end gap-2">
            <Button variant="outline" onClick={handleCloseModal} disabled={saveMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingBarber ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Staff Member?
            </DialogTitle>
          </DialogHeader>

          <div className="py-2 text-sm text-muted-foreground">
            Are you sure you want to remove <span className="font-semibold text-foreground">{deletingBarber?.name}</span> from your staff? This action cannot be undone.
          </div>

          <DialogFooter className="flex sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingBarber && deleteMutation.mutate(deletingBarber.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
