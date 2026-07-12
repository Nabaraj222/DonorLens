'use client';

import { useEffect, useState } from 'react';
import ProjectCard from '@/components/ProjectCard';
import type { Project } from '@/lib/projects';
import { useDonations } from '@/lib/useDonations';

export default function Home() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { donations, error: chainError, refresh } = useDonations();

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => {
        if (!res.ok) throw new Error(`API error ${res.status}`);
        return res.json();
      })
      .then(setProjects)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col items-center gap-3 py-8 text-center">
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          Transparent donations for NGOs on{' '}
          <span className="bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
            Solana
          </span>
        </h1>
        <p className="max-w-xl text-slate-400">
          Connect your wallet, pick a project, and donate SOL. Every donation
          is a verifiable on-chain transaction.
        </p>
      </section>

      {error && (
        <p className="text-center text-red-400">
          Failed to load projects: {error}
        </p>
      )}

      {chainError && (
        <p className="text-center text-xs text-amber-400">
          Couldn&apos;t load donation history from the chain:{' '}
          <span className="font-mono">{chainError}</span>{' '}
          <button onClick={refresh} className="underline hover:text-amber-300">
            Retry
          </button>
        </p>
      )}

      {!projects && !error && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-96 animate-pulse rounded-xl border border-slate-800 bg-slate-900"
            />
          ))}
        </div>
      )}

      {projects && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              donations={
                donations
                  ? donations.filter((d) => d.projectId === project.id)
                  : null
              }
              onDonated={refresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}
