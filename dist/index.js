"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
class TaskItto {
    constructor(concurrentThreads = 1, maxTaskWaitTime = 60) {
        this.queue = [];
        this.services = {};
        this.duration = {
            average: 0,
            max: 0,
            min: 0,
        };
        this.listeners = {
            onAddTask: undefined,
            onEndTask: undefined,
        };
        this.concurrentThreads = concurrentThreads;
        this.maxTaskWaitTime = maxTaskWaitTime;
    }
    addTaskListener(type, listener) {
        this.listeners[type] = listener;
    }
    taskExists(task) {
        return this.queue.find((t) => t.id === task.id);
    }
    /**
     * Bump the given task to the head of the queue with
     * any new parameter changed
     */
    prioritizeTask(task) {
        this.queue = this.queue.filter((t) => t.id !== task.id);
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
    addTask(task, resolve) {
        var _a, _b;
        let taskId = task.id;
        if (!taskId) {
            taskId = (0, uuid_1.v4)();
        }
        const preparedTask = Object.assign(Object.assign({}, task), { id: taskId, resolve: resolve });
        if (this.taskExists(preparedTask)) {
            this.prioritizeTask(preparedTask);
        }
        else {
            this.queue.push(preparedTask);
        }
        (_b = (_a = this.listeners).onAddTask) === null || _b === void 0 ? void 0 : _b.call(_a, preparedTask);
        return taskId;
    }
    getTask(taskId) {
        return this.queue.find((t) => t.id === taskId);
    }
    serviceAcceptTasks(service) {
        return service.taskIds.length < this.concurrentThreads;
    }
    /**
     * Returns the next task to be executed
     * starts the task and locks the service
     */
    runTask(workerId, taskId) {
        var _a, _b;
        const service = this.services[workerId];
        if (!this.serviceAcceptTasks(service)) {
            return;
        }
        const task = this.getTask(taskId);
        if (!task)
            return;
        task.status = "running";
        task.worker = workerId;
        service.taskIds.push(taskId);
        (_b = (_a = this.listeners).onRunTask) === null || _b === void 0 ? void 0 : _b.call(_a, task);
        return task;
    }
    /**
     * Filters the queue to remove the task, and execute the resolve function if any
     */
    finishTask(taskId) {
        var _a, _b, _c;
        const task = this.getTask(taskId);
        if (!task)
            return;
        this.queue = this.queue.filter((t) => t.id !== taskId);
        (_a = task.resolve) === null || _a === void 0 ? void 0 : _a.call(task, task);
        (_c = (_b = this.listeners).onEndTask) === null || _c === void 0 ? void 0 : _c.call(_b, task);
    }
    /**
     * Register a new service to the available ones
     * only registered services will be able to execute tasks
     */
    registerService(serviceId) {
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
    unregisterService(serviceId) {
        delete this.services[serviceId];
    }
}
exports.default = TaskItto;
//# sourceMappingURL=index.js.map