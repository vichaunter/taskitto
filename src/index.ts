import { v4 } from "uuid";

type Task = {
  id?: string;
  resolve?: (task: Task) => void;
  worker?: string;
  status?: "running" | "pending";
} & Record<string, unknown>;

type Duration = {
  average: number;
  max: number;
  min: number;
};
type Service = {
  id: string;
  taskIds: string[];
};
type ServiceWorkers = { [key: Service["id"]]: Service };
type Listeners = {
  onAddTask?: (task: Task) => void;
  onEndTask?: (task: Task) => void;
  onRunTask?: (task: Task) => void;
};

class TaskItto {
  queue: Task[] = [];
  services: ServiceWorkers = {};
  duration: Duration = {
    average: 0,
    max: 0,
    min: 0,
  };
  concurrentThreads: number;
  maxTaskWaitTime: number;

  listeners: Listeners = {
    onAddTask: undefined,
    onEndTask: undefined,
  };

  constructor(concurrentThreads = 1, maxTaskWaitTime = 60) {
    this.concurrentThreads = concurrentThreads;
    this.maxTaskWaitTime = maxTaskWaitTime;
  }

  addTaskListener(type: keyof Listeners, listener: Listeners["onAddTask"]) {
    this.listeners[type] = listener;
  }

  taskExists(task: Task) {
    return this.queue.find((t: Task) => t.id === task.id);
  }

  /**
   * Bump the given task to the head of the queue with
   * any new parameter changed
   */
  prioritizeTask(task: Task) {
    this.queue = this.queue.filter((t: Task) => t.id !== task.id);
    this.queue.unshift(task);
  }

  /**
   * Add a new task to the queue
   * If no id is provided, a new one will be generated and returned
   * If the task already exists, it will be bumped to the head of the queue
   *
   * @param task Task to be added to the queue
   * @param resolve Function to be called when the task is finished
   *                have in mind that the task will be executed by FIFO order unless is added again to gain priority
   *                the resolve function is executed by finishTask that is called also from the external system using the library
   */
  addTask(task: Task, resolve?: () => void): string | void {
    let taskId = task.id;
    if (!taskId) {
      taskId = v4();
    }

    const preparedTask = {
      ...task,
      id: taskId,
      resolve: resolve,
    };

    if (this.taskExists(preparedTask)) {
      this.prioritizeTask(preparedTask);
    } else {
      this.queue.push(preparedTask);
    }

    this.listeners.onAddTask?.(preparedTask);

    return taskId;
  }

  getTask(taskId: string) {
    return this.queue.find((t: Task) => t.id === taskId);
  }

  serviceAcceptTasks(service: Service) {
    return service.taskIds.length < this.concurrentThreads;
  }

  /**
   * Returns the next task to be executed
   * starts the task and locks the service
   */
  runTask(workerId: string, taskId: string) {
    const service = this.services[workerId];
    if (!this.serviceAcceptTasks(service)) {
      return;
    }
    const task = this.getTask(taskId);
    if (!task) return;

    task.status = "running";
    task.worker = workerId;
    service.taskIds.push(taskId);

    this.listeners.onRunTask?.(task);

    return task;
  }

  /**
   * Filters the queue to remove the task, and execute the resolve function if any
   */
  finishTask(taskId: string) {
    const task = this.getTask(taskId);
    if (!task) return;

    this.queue = this.queue.filter((t: Task) => t.id !== taskId);

    task.resolve?.(task);
    this.listeners.onEndTask?.(task);
  }

  /**
   * Register a new service to the available ones
   * only registered services will be able to execute tasks
   */
  registerService(serviceId: string) {
    if (this.services[serviceId]) {
      return new Error("Service already exists");
    }

    this.services[serviceId] = {
      id: serviceId,
      taskIds: [],
    };
  }

  /**
   * Remove a service from the available ones
   */
  unregisterService(serviceId: string) {
    delete this.services[serviceId];
  }
}

export default TaskItto;
