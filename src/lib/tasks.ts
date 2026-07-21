import type { SupabaseClient } from "@supabase/supabase-js";

export const TASK_TYPES = ["call", "message", "proposal", "other"] as const;
export type TaskType = (typeof TASK_TYPES)[number];

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  call: "Позвонить",
  message: "Написать",
  proposal: "Отправить КП",
  other: "Другое",
};

export type Task = {
  id: string;
  lead_id: string;
  description: string | null;
  due_at: string | null;
  done: boolean;
  type: TaskType;
  assignee_id: string | null;
  created_at: string;
};

export type TaskWithLead = Task & {
  leads: { id: string; name: string } | null;
};

const TASK_COLUMNS = "id, lead_id, description, due_at, done, type, assignee_id, created_at";
const TASK_COLUMNS_WITH_LEAD = `${TASK_COLUMNS}, leads(id, name)`;

export async function getTasksForLead(client: SupabaseClient, leadId: string): Promise<Task[]> {
  const { data, error } = await client
    .from("tasks")
    .select(TASK_COLUMNS)
    .eq("lead_id", leadId)
    .order("done", { ascending: true })
    .order("due_at", { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(`Failed to load tasks: ${error.message}`);
  }

  return data as Task[];
}

export async function getAllTasks(client: SupabaseClient): Promise<TaskWithLead[]> {
  const { data, error } = await client
    .from("tasks")
    .select(TASK_COLUMNS_WITH_LEAD)
    .order("done", { ascending: true })
    .order("due_at", { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(`Failed to load tasks: ${error.message}`);
  }

  return data as unknown as TaskWithLead[];
}

export async function createTask(
  client: SupabaseClient,
  input: { leadId: string; description: string; dueAt: string | null; type: TaskType; assigneeId: string | null },
): Promise<TaskWithLead> {
  const { data: userData } = await client.auth.getUser();

  const { data, error } = await client
    .from("tasks")
    .insert({
      lead_id: input.leadId,
      description: input.description || null,
      due_at: input.dueAt,
      type: input.type,
      assignee_id: input.assigneeId,
      created_by: userData.user?.id ?? null,
    })
    .select(TASK_COLUMNS_WITH_LEAD)
    .single();

  if (error) {
    throw new Error(`Failed to create task: ${error.message}`);
  }

  return data as unknown as TaskWithLead;
}

export async function updateTaskDone(client: SupabaseClient, id: string, done: boolean): Promise<void> {
  const { error } = await client.from("tasks").update({ done }).eq("id", id);

  if (error) {
    throw new Error(`Failed to update task: ${error.message}`);
  }
}

export async function deleteTask(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from("tasks").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete task: ${error.message}`);
  }
}
