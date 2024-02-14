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
type ServiceWorkers = {
    [key: Service["id"]]: Service;
};
type Listeners = {
    onAddTask?: (task: Task) => void;
    onEndTask?: (task: Task) => void;
    onRunTask?: (task: Task) => void;
};
declare class TaskItto {
    queue: Task[];
    services: ServiceWorkers;
    duration: Duration;
    concurrentThreads: number;
    maxTaskWaitTime: number;
    listeners: Listeners;
    constructor(concurrentThreads?: number, maxTaskWaitTime?: number);
    addTaskListener(type: keyof Listeners, listener: Listeners["onAddTask"]): void;
    taskExists(task: Task): Task | undefined;
    /**
     * Bump the given task to the head of the queue with
     * any new parameter changed
     */
    prioritizeTask(task: Task): void;
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
    addTask(task: Task, resolve?: () => void): string | void;
    getTask(taskId: string): Task | undefined;
    serviceAcceptTasks(service: Service): boolean;
    /**
     * Returns the next task to be executed
     * starts the task and locks the service
     */
    runTask(workerId: string, taskId: string): Task | undefined;
    /**
     * Filters the queue to remove the task, and execute the resolve function if any
     */
    finishTask(taskId: string): void;
    /**
     * Register a new service to the available ones
     * only registered services will be able to execute tasks
     */
    registerService(serviceId: string): Error | undefined;
    /**
     * Remove a service from the available ones
     */
    unregisterService(serviceId: string): void;
}
export default TaskItto;
