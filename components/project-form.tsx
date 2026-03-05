'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  liveUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  tags: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  initialData?: Project;
  onSubmit: (data: Omit<Project, 'id' | 'createdAt'> & { id?: string; createdAt?: number }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const STEPS = [
  { label: 'Basic Info', fields: ['title', 'description'] as const },
  { label: 'Links', fields: ['liveUrl', 'githubUrl'] as const },
  { label: 'Tags', fields: ['tags'] as const },
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-6 flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors',
              i < current
                ? 'bg-primary text-primary-foreground'
                : i === current
                ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {i < current ? '✓' : i + 1}
          </div>
          {i < total - 1 && (
            <div className={cn('h-px w-8 transition-colors', i < current ? 'bg-primary' : 'bg-muted')} />
          )}
        </div>
      ))}
      <span className="ml-2 text-sm text-muted-foreground">
        {STEPS[current].label}
      </span>
    </div>
  );
}

export function ProjectForm({ initialData, onSubmit, onCancel, isLoading }: ProjectFormProps) {
  const isEdit = !!initialData;
  const [step, setStep] = useState(0);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      liveUrl: initialData?.liveUrl || '',
      githubUrl: initialData?.githubUrl || '',
      tags: initialData?.tags?.join(', ') || '',
    },
    mode: 'onTouched',
  });

  const buildPayload = (data: ProjectFormData) => ({
    id: initialData?.id,
    createdAt: initialData?.createdAt,
    title: data.title,
    description: data.description || undefined,
    liveUrl: data.liveUrl || undefined,
    githubUrl: data.githubUrl || undefined,
    tags: data.tags
      ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : undefined,
  });

  // Edit mode: single-page form
  if (isEdit) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit((d) => onSubmit(buildPayload(d)))} className="space-y-5">
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem>
              <FormLabel>Project Title</FormLabel>
              <FormControl><Input placeholder="My Awesome Project" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl><Textarea placeholder="Tell us about your project..." rows={3} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="liveUrl" render={({ field }) => (
            <FormItem>
              <FormLabel>Live URL</FormLabel>
              <FormControl><Input placeholder="https://example.com" type="url" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="githubUrl" render={({ field }) => (
            <FormItem>
              <FormLabel>GitHub URL</FormLabel>
              <FormControl><Input placeholder="https://github.com/username/repo" type="url" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="tags" render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl><Input placeholder="React, TypeScript, Next.js" {...field} /></FormControl>
              <FormDescription>Comma-separated</FormDescription>
              <FormMessage />
            </FormItem>
          )} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isLoading} className="flex-1">Update Project</Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
          </div>
        </form>
      </Form>
    );
  }

  // Create mode: wizard
  const isLastStep = step === STEPS.length - 1;

  const handleNext = async () => {
    const fields = STEPS[step].fields;
    const valid = await form.trigger(fields as (keyof ProjectFormData)[]);
    if (valid) setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleFinalSubmit = form.handleSubmit((data) => onSubmit(buildPayload(data)));

  return (
    <Form {...form}>
      <form onSubmit={(e) => { e.preventDefault(); if (isLastStep) handleFinalSubmit(e); }} className="space-y-5">
        <StepIndicator current={step} total={STEPS.length} />

        {step === 0 && (
          <>
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Project Title <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder="My Awesome Project" autoFocus {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Tell us about your project..." rows={4} {...field} /></FormControl>
                <FormDescription>Optional: A brief description of the project</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </>
        )}

        {step === 1 && (
          <>
            <FormField control={form.control} name="liveUrl" render={({ field }) => (
              <FormItem>
                <FormLabel>Live URL</FormLabel>
                <FormControl><Input placeholder="https://example.com" type="url" autoFocus {...field} /></FormControl>
                <FormDescription>Optional: Link to the live project</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="githubUrl" render={({ field }) => (
              <FormItem>
                <FormLabel>GitHub URL</FormLabel>
                <FormControl><Input placeholder="https://github.com/username/repo" type="url" {...field} /></FormControl>
                <FormDescription>Optional: Link to the GitHub repository</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </>
        )}

        {step === 2 && (
          <FormField control={form.control} name="tags" render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl><Input placeholder="React, TypeScript, Next.js" autoFocus {...field} /></FormControl>
              <FormDescription>Optional: Comma-separated list of technologies</FormDescription>
              <FormMessage />
            </FormItem>
          )} />
        )}

        <div className="flex gap-3 pt-2">
          {step > 0 && (
            <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading}>
              Back
            </Button>
          )}
          {step === 0 && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          {!isLastStep ? (
            <Button type="button" onClick={handleNext} className="flex-1">
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : 'Add Project'}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
