import { afterEach, describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api";
import type { SharedWorkProjectProjection, SharedWorkTaskProjection } from "@/lib/contracts";
import {
  fetchProjectDetail,
  fetchProjects,
} from "@/features/shared-work/projects/project-model";
import { addTaskDependency, fetchTaskDetail, fetchTasks, removeTaskDependency, taskFromProjection } from "@/features/shared-work/tasks/task-model";

const project: SharedWorkProjectProjection = {
  project_id: "project_1",
  tenant_id: "tenant_1",
  organization_id: "organization_1",
  workspace_ids: ["workspace_1"],
  code: "PRJ-1",
  name: "Proyek satu",
  status: "PLANNED",
  created_at: "2026-09-30T00:00:00Z",
  updated_at: "2026-09-30T00:00:00Z",
};

const task: SharedWorkTaskProjection = {
  task_id: "task_1",
  tenant_id: "tenant_1",
  organization_id: "organization_1",
  workspace_ids: ["workspace_1"],
  project_id: "project_1",
  title: "Tugas satu",
  status: "OPEN",
  priority: "NORMAL",
  created_by: "actor_1",
  created_at: "2026-09-30T00:00:00Z",
  updated_at: "2026-09-30T00:00:00Z",
};

describe("Projects and Tasks canonical API adapters", () => {
  afterEach(() => vi.restoreAllMocks());

  it("maps authoritative task dependencies and uses dedicated mutations", async () => {
    const enriched = { ...task, blocked_by: [{
      blocked_by_task_id: "task_2", title: "Tugas prasyarat", status: "OPEN" as const,
      linked_at: "2026-09-30T00:00:00Z",
    }] };
    expect(taskFromProjection(enriched)).toMatchObject({
      blockedBy: ["task_2"], blockedByTitles: ["Tugas prasyarat"],
    });
    const request = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue(enriched);
    await addTaskDependency("task_1", "task_2");
    await removeTaskDependency("task_1", "task_2");
    expect(request).toHaveBeenNthCalledWith(1, "/api/v1/tasks/task_1/dependencies", {
      method: "POST", body: { blocked_by_task_id: "task_2" },
    });
    expect(request).toHaveBeenNthCalledWith(2, "/api/v1/tasks/task_1/dependencies/task_2", {
      method: "DELETE",
    });
  });

  it("maps PostgreSQL project projection without inventing metrics or display names", async () => {
    const request = vi.spyOn(api, "authenticatedApiRequest")
      .mockResolvedValueOnce([project])
      .mockResolvedValueOnce(project);

    const listed = await fetchProjects({ status: "PLANNED", search: "Proyek" });
    const detail = await fetchProjectDetail("project_1");

    expect(request).toHaveBeenNthCalledWith(1, "/api/v1/projects?search=Proyek&status=PLANNED", expect.any(Object));
    expect(request).toHaveBeenNthCalledWith(2, "/api/v1/projects/project_1", expect.any(Object));
    expect(listed.connected).toBe(true);
    expect(listed.data[0]).toMatchObject({
      id: "project_1",
      workspaceIds: ["workspace_1"],
      ownerName: null,
      workspaceName: null,
      progressPercentage: null,
      riskLevel: null,
      tasksCount: null,
      documentsCount: null,
    });
    expect(detail.data).toEqual(listed.data[0]);
  });

  it("maps PostgreSQL task projection without inventing relations or counts", async () => {
    const request = vi.spyOn(api, "authenticatedApiRequest")
      .mockResolvedValueOnce([task])
      .mockResolvedValueOnce(task);

    const listed = await fetchTasks({ priority: "NORMAL", status: "OPEN" });
    const detail = await fetchTaskDetail("task_1");

    expect(request).toHaveBeenNthCalledWith(1, "/api/v1/tasks?status=OPEN&priority=NORMAL", expect.any(Object));
    expect(request).toHaveBeenNthCalledWith(2, "/api/v1/tasks/task_1", expect.any(Object));
    expect(listed.connected).toBe(true);
    expect(listed.data[0]).toMatchObject({
      id: "task_1",
      projectId: "project_1",
      projectName: null,
      ownerName: null,
      creatorName: null,
      commentsCount: null,
      evidenceCount: null,
      workspaceIds: ["workspace_1"],
    });
    expect(detail.data).toEqual(listed.data[0]);
  });
});
