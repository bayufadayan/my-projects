import { NextResponse } from 'next/server';
import sql, { initDB } from '@/lib/db';
import { Project } from '@/lib/types';

export async function GET() {
  try {
    await initDB();
    const rows = await sql`
      SELECT id, title, description, live_url, github_url, tags, created_at
      FROM projects
      ORDER BY created_at DESC
    `;
    const projects: Project[] = rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description ?? undefined,
      liveUrl: r.live_url ?? undefined,
      githubUrl: r.github_url ?? undefined,
      tags: r.tags ?? undefined,
      createdAt: Number(r.created_at),
    }));
    return NextResponse.json(projects);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDB();
    const body: Omit<Project, 'id' | 'createdAt'> = await request.json();
    const id = Date.now().toString();
    const createdAt = Date.now();

    await sql`
      INSERT INTO projects (id, title, description, live_url, github_url, tags, created_at)
      VALUES (
        ${id},
        ${body.title},
        ${body.description ?? null},
        ${body.liveUrl ?? null},
        ${body.githubUrl ?? null},
        ${body.tags ?? null},
        ${createdAt}
      )
    `;

    const project: Project = { id, createdAt, ...body };
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
