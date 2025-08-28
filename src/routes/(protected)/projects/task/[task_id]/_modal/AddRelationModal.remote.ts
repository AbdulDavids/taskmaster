import { form, getRequestEvent, query } from '$app/server';
import { db } from '$lib/db';
import { taskDependencyTypeEnum, taskDependencies, tasks } from '$lib/db/schemas/schema';
import { validateForm } from '$lib/util.server';
import { and, eq, not } from 'drizzle-orm';
import z from 'zod';

const GetTasksRequest = z.object({
  projectId: z.string().uuid(),
  excludeTaskIds: z.string().uuid().array().optional()
});

export const getTasks = query(GetTasksRequest, async (params) => {
  const { locals } = getRequestEvent();
  const { user } = await locals.validateSession();
  const { projectId, excludeTaskIds = [] } = params;

  const result = await db.query.tasks.findMany({
    where: and(
      eq(tasks.project_id, projectId),
      eq(tasks.created_by, user.id),
      ...excludeTaskIds.map((id) => not(eq(tasks.id, id)))
    )
  });

  return result;
});

const AddRelationForm = z.object({
  task_id: z.string().uuid(),
  related_task_id: z.string().uuid(),
  dependency_type: z.enum(taskDependencyTypeEnum.enumValues)
});

export const addRelationForm = form(async (formData) => {
  const { locals } = getRequestEvent();
  const { user } = await locals.validateSession();

  const validatedReq = validateForm(formData, AddRelationForm);

  if (!validatedReq.success) {
    return { success: false, errors: validatedReq.error.formErrors };
  }

  const {
    related_task_id: relatedTaskId,
    task_id: taskId,
    dependency_type: dependencyType
  } = validatedReq.data;

  try {
    await db.insert(taskDependencies).values({
      task_id: taskId,
      depends_on_task_id: relatedTaskId,
      dependency_type: dependencyType,
      created_by: user.id
    });
  } catch (error) {
    console.error('Error adding relation:', error);
    return { success: false, errors: { form: ['Failed to add relation. Please try again.'] } };
  }

  return { success: true };
});
