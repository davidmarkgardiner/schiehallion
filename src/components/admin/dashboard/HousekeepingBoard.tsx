import { useEffect, useMemo, useState } from 'react'

import type { HousekeepingTask, HousekeepingWorkflowStatus } from '@/types/operations'

interface HousekeepingBoardProps {
  tasks: HousekeepingTask[]
  onStatusChange: (taskId: string, status: HousekeepingWorkflowStatus) => void
  onReassign: (taskId: string, teamMember: string) => void
  team: string[]
}

const statusLabels: { value: HousekeepingWorkflowStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'inspecting', label: 'Inspecting' },
]

const priorityStyles: Record<HousekeepingTask['priority'], string> = {
  high: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-800/40 dark:text-slate-200',
}

const statusChipStyles: Record<HousekeepingWorkflowStatus, string> = {
  pending: 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200',
  'in-progress': 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
  inspecting: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200',
}

export function HousekeepingBoard({ tasks, onStatusChange, onReassign, team }: HousekeepingBoardProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(interval)
  }, [])

  const progressSummary = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((task) => task.status === 'completed').length
    const inProgress = tasks.filter((task) => task.status === 'in-progress').length
    const pending = total - completed - inProgress

    return {
      total,
      completed,
      inProgress,
      pending,
      completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
    }
  }, [tasks])

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-4 lg:flex-row lg:items-center lg:justify-between dark:border-slate-800">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Housekeeping management</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track cleaning progress, field assignments, and mobile task sync across the team.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
            <p className="font-semibold">{progressSummary.completionRate}% complete</p>
            <p>{progressSummary.completed} / {progressSummary.total} rooms</p>
          </div>
          <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3 text-sky-700 dark:border-sky-800 dark:bg-sky-900/40 dark:text-sky-200">
            <p className="font-semibold">{progressSummary.inProgress} in progress</p>
            <p>{progressSummary.pending} pending</p>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th className="px-6 py-3 text-left">Room</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Priority</th>
              <th className="px-6 py-3 text-left">Team member</th>
              <th className="px-6 py-3 text-left">Time tracking</th>
              <th className="px-6 py-3 text-left">Mobile sync</th>
              <th className="px-6 py-3 text-left">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
            {tasks.map((task) => {
              const elapsedMinutes = Math.max(0, Math.round((now - new Date(task.startTime).getTime()) / 60000))
              const progressPercentage = Math.min(100, Math.round((elapsedMinutes / task.estimatedDuration) * 100))

              return (
                <tr key={task.id} className="align-top">
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-200">
                    <div className="font-semibold">Room {task.roomNumber}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Last update {new Date(task.lastUpdated).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusChipStyles[task.status]}`}>
                      {task.status.replace('-', ' ')}
                    </span>
                    <div className="mt-2">
                      <select
                        value={task.status}
                        onChange={(event) => onStatusChange(task.id, event.target.value as HousekeepingWorkflowStatus)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        {statusLabels.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[task.priority]}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-700 dark:text-slate-200">{task.assignedTo}</div>
                    <select
                      value={task.assignedTo}
                      onChange={(event) => onReassign(task.id, event.target.value)}
                      className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {team.map((member) => (
                        <option key={member} value={member}>
                          {member}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    <div className="font-semibold">{elapsedMinutes} min elapsed</div>
                    <div className="mt-1 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-emerald-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Est. {task.estimatedDuration} min
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {task.mobileDevice}
                    </div>
                    <p className="mt-1 text-[11px]">Synced via mobile supervisor app.</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                    {task.notes ?? '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
