'use client';

import { useEffect, useState } from 'react';
import { Project } from '@/lib/types';
import { Navbar } from '@/components/navbar';
import { ProjectCard } from '@/components/project-card';
import { ProjectForm } from '@/components/project-form';
import { ConfirmDeleteModal } from '@/components/confirm-delete-modal';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Load projects from database on mount
  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((error) => console.error('Failed to load projects:', error))
      .finally(() => setIsFetching(false));
  }, []);

  const handleAddProject = () => {
    setSelectedProject(null);
    setIsFormOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (
    data: Omit<Project, 'id' | 'createdAt'> & { id?: string; createdAt?: number }
  ) => {
    setIsLoading(true);
    try {
      if (data.id) {
        // Update existing project
        await fetch(`/api/projects/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        setProjects((prev) =>
          prev.map((p) =>
            p.id === data.id
              ? { ...data, id: data.id!, createdAt: data.createdAt || p.createdAt }
              : p
          )
        );
      } else {
        // Add new project
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const newProject: Project = await res.json();
        setProjects((prev) => [newProject, ...prev]);
      }
      setIsFormOpen(false);
      setSelectedProject(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (project) {
      setProjectToDelete(id);
      setSelectedProject(project);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setIsLoading(true);
    try {
      await fetch(`/api/projects/${projectToDelete}`, { method: 'DELETE' });
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete));
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
      setSelectedProject(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Your Projects</h2>
            <p className="mt-2 text-muted-foreground">
              {projects.length} project{projects.length !== 1 ? 's' : ''} in your collection
            </p>
          </div>
          <Button onClick={handleAddProject} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            New Project
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="mb-4 text-lg font-medium text-foreground">No projects yet</p>
            <p className="mb-6 text-muted-foreground">
              Create your first project to get started. Showcase your work and share your accomplishments.
            </p>
            <Button onClick={handleAddProject} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Project
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEditProject}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedProject ? 'Edit Project' : 'New Project'}</DialogTitle>
            {selectedProject && (
              <DialogDescription>Update the details of your project</DialogDescription>
            )}
          </DialogHeader>
          <ProjectForm
            initialData={selectedProject || undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedProject(null);
            }}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        projectTitle={selectedProject?.title || ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setProjectToDelete(null);
          setSelectedProject(null);
        }}
        isLoading={isLoading}
      />
    </main>
  );
}
