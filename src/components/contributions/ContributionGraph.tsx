"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type {
  ContributionCell,
  ContributionStats,
  ContributionWeek,
} from "@/lib/project-data";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getLevelClass(level: ContributionCell["level"]): string {
  switch (level) {
    case 1:
      return "bg-emerald-950/90 border-emerald-900/80";
    case 2:
      return "bg-emerald-800/80 border-emerald-700/70";
    case 3:
      return "bg-emerald-500/80 border-emerald-400/70";
    case 4:
      return "bg-lime-400 border-lime-300";
    default:
      return "bg-neutral-900 border-neutral-800";
  }
}

export function ContributionGraph({
  weeks,
  stats,
  compact = false,
  title = "Activity graph",
  pageSize = 24,
}: {
  weeks: ContributionWeek[];
  stats: ContributionStats;
  compact?: boolean;
  title?: string;
  pageSize?: number;
}) {
  const maxPageSize = Math.max(1, pageSize);
  const pageCount = Math.max(1, Math.ceil(weeks.length / maxPageSize));
  const [currentPage, setCurrentPage] = useState(0);

  const visibleWeeks = useMemo(
    () =>
      weeks.slice(currentPage * maxPageSize, (currentPage + 1) * maxPageSize),
    [currentPage, maxPageSize, weeks],
  );

  const firstActiveCell = useMemo(() => {
    for (const week of visibleWeeks) {
      for (const cell of week.cells) {
        if (cell.count > 0) {
          return cell;
        }
      }
    }

    return visibleWeeks[0]?.cells[0] ?? weeks[0]?.cells[0];
  }, [visibleWeeks, weeks]);

  const [selectedCell, setSelectedCell] = useState(firstActiveCell);

  useEffect(() => {
    setSelectedCell(firstActiveCell);
  }, [firstActiveCell]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, pageCount - 1));
  }, [pageCount]);

  const visibleCell = selectedCell ?? firstActiveCell;
  const startWeek = currentPage * maxPageSize + 1;
  const endWeek = Math.min((currentPage + 1) * maxPageSize, weeks.length);
  const canGoPrevious = currentPage > 0;
  const canGoNext = currentPage < pageCount - 1;

  const goPrevious = () => setCurrentPage((page) => Math.max(0, page - 1));
  const goNext = () =>
    setCurrentPage((page) => Math.min(pageCount - 1, page + 1));

  return (
    <section
      className={
        compact
          ? "rounded-3xl border border-neutral-800 bg-neutral-950/60 p-3 shadow-xl shadow-black/20 backdrop-blur"
          : "rounded-3xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-2xl shadow-black/30 backdrop-blur"
      }
    >
      <div
        className={
          compact
            ? "flex items-center justify-between gap-3"
            : "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
        }
      >
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
            Contributions
          </p>
          <h2
            className={`${compact ? "mt-1 text-lg" : "mt-2 text-3xl"} font-semibold text-white`}
          >
            {title}
          </h2>
          {!compact && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
              Project launches, release updates, and milestones merged with
              GitHub contribution activity.
            </p>
          )}
        </div>

        {!compact && visibleCell && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-3 text-sm text-neutral-300 lg:max-w-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
              Selected day
            </p>
            <p className="mt-1 font-medium text-white">
              {formatDate(visibleCell.date)}
            </p>
            <p className="mt-1 text-neutral-400">
              {visibleCell.count === 0
                ? "No activity recorded"
                : `${visibleCell.count} contribution${visibleCell.count === 1 ? "" : "s"}`}
              {visibleCell.githubCount > 0 &&
                visibleCell.items.length > 0 &&
                ` (${visibleCell.items.length} project, ${visibleCell.githubCount} GitHub)`}
            </p>
          </div>
        )}
      </div>

      <div
        className={
          compact ? "mt-3 overflow-x-auto pb-1" : "mt-6 overflow-x-auto pb-2"
        }
      >
        <div className="min-w-[920px]">
          {!compact && (
            <div className="mb-3 flex gap-1 pl-10 text-[10px] uppercase tracking-[0.25em] text-neutral-500">
              {visibleWeeks.map((week, index) => (
                <div
                  key={`${week.label ?? "week"}-${index}`}
                  className="w-3 text-center"
                >
                  {week.label ?? ""}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            {!compact && (
              <div className="flex w-10 flex-col justify-between py-1 text-[10px] uppercase tracking-[0.25em] text-neutral-600">
                <span>Sun</span>
                <span>Tue</span>
                <span>Thu</span>
                <span>Sat</span>
              </div>
            )}

            <div className="flex gap-1">
              {visibleWeeks.map((week, weekIndex) => (
                <div key={`week-${weekIndex}`} className="flex flex-col gap-1">
                  {week.cells.map((cell) => {
                    const content = (
                      <button
                        key={cell.date}
                        type="button"
                        onMouseEnter={() => setSelectedCell(cell)}
                        onFocus={() => setSelectedCell(cell)}
                        className={`rounded-[3px] border transition-transform duration-200 hover:-translate-y-[1px] hover:scale-110 ${compact ? "h-2.5 w-2.5" : "h-3 w-3"} ${getLevelClass(cell.level)}`}
                        aria-label={`${formatDate(cell.date)}: ${cell.count} contribution${cell.count === 1 ? "" : "s"}`}
                      />
                    );

                    return content;
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {!compact && (
        <div className="mt-5 flex flex-col gap-4 border-t border-neutral-800 pt-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-4 text-sm text-neutral-400">
            <span>
              <strong className="text-white">{stats.totalItems}</strong> project
              entries
            </span>
            {stats.githubCount > 0 && (
              <span>
                <strong className="text-white">{stats.githubCount}</strong>{" "}
                GitHub contributions
              </span>
            )}
            <span>
              <strong className="text-white">{stats.activeDays}</strong> active
              days
            </span>
            {stats.firstDate && (
              <span>Started {formatDate(stats.firstDate)}</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span>Less</span>
              <span className="h-3 w-3 rounded-[3px] border border-neutral-800 bg-neutral-900" />
              <span className="h-3 w-3 rounded-[3px] border border-emerald-900/80 bg-emerald-950/90" />
              <span className="h-3 w-3 rounded-[3px] border border-emerald-700/70 bg-emerald-800/80" />
              <span className="h-3 w-3 rounded-[3px] border border-emerald-400/70 bg-emerald-500/80" />
              <span className="h-3 w-3 rounded-[3px] border border-lime-300 bg-lime-400" />
              <span>More</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <button
                type="button"
                onClick={goPrevious}
                disabled={!canGoPrevious}
                className="rounded-full border border-neutral-700 px-3 py-1 transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span>
                Page {currentPage + 1} of {pageCount}
              </span>
              <button
                type="button"
                onClick={goNext}
                disabled={!canGoNext}
                className="rounded-full border border-neutral-700 px-3 py-1 transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>

            <span className="text-xs text-neutral-500">
              Showing weeks {startWeek} to {endWeek} of {weeks.length}
            </span>
          </div>
        </div>
      )}

      {compact && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800/70 pt-3 text-xs text-neutral-500">
          <span>
            Page {currentPage + 1} / {pageCount} · {stats.totalItems} entries
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrevious}
              disabled={!canGoPrevious}
              className="rounded-full border border-neutral-700 px-2.5 py-1 text-neutral-300 transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext}
              className="rounded-full border border-neutral-700 px-2.5 py-1 text-neutral-300 transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
            <Link
              href="/contributions"
              className="text-white underline underline-offset-4"
            >
              Archive
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
