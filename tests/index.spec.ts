import TaskItto from "../src/index";

const TASK = {
  url: "https://example.com",
  neco: "necostring",
};
const TASK_WITH_ID = {
  id: "taskId",
  ...TASK,
};
const WORKER = "workerId";
const WORKER_TWO = "workerId2";

describe("TaskItto", () => {
  let taskItto: TaskItto = new TaskItto();

  const setup = ({
    concurrentThreads = 1,
    maxTaskWaitTime = 60,
    worker = WORKER,
  }: {
    concurrentThreads?: number;
    maxTaskWaitTime?: number;
    worker?: string;
  } = {}) => {
    taskItto = new TaskItto(concurrentThreads, maxTaskWaitTime);
    taskItto.registerService(worker);
  };

  beforeEach(() => {
    taskItto = new TaskItto();
  });

  it("can add task", () => {
    const taskId = taskItto.addTask(TASK_WITH_ID);

    expect(taskItto.getTask(taskId as string)).toEqual(TASK_WITH_ID);
  });

  it("can add task without id", () => {
    const taskId = taskItto.addTask(TASK);

    expect(taskId).toBeDefined();

    expect(taskItto.getTask(taskId as string)).toEqual({ id: taskId, ...TASK });
  });

  it("worker can run task by max threads", () => {
    setup();

    const taskOne = taskItto.addTask(TASK);
    const taskTwo = taskItto.addTask(TASK);
    const taskThree = taskItto.addTask(TASK);

    const ranTask = taskItto.runTask(WORKER, taskOne as string);
    expect(ranTask?.status).toBe("running");

    const ranTaskTwo = taskItto.runTask(WORKER, taskTwo as string);
    expect(ranTaskTwo?.status).toBeFalsy();

    const ranTaskThree = taskItto.runTask(WORKER, taskThree as string);
    expect(ranTaskThree?.status).toBeFalsy();

    expect(taskItto.queue.length).toBe(3);
  });

  it("multiple workers can run tasks concurrently", () => {
    setup();

    const taskOne = taskItto.addTask(TASK);
    const taskTwo = taskItto.addTask(TASK);

    expect(taskItto.queue.length).toBe(2);

    const ranTask = taskItto.runTask(WORKER, taskOne as string);
    expect(ranTask?.status).toBe("running");
    expect(ranTask?.worker).toBe(WORKER);

    taskItto.registerService(WORKER_TWO);
    expect(taskItto.services[WORKER_TWO]).toBeDefined();
    const ranTaskTwo = taskItto.runTask(WORKER_TWO, taskTwo as string);
    expect(ranTaskTwo?.status).toBe("running");
    expect(ranTaskTwo?.worker).toBe(WORKER_TWO);

    expect(taskItto.queue.length).toBe(2);
  });

  it("worker can finish task", () => {
    setup();

    const taskOne = taskItto.addTask(TASK);
    const ranTask = taskItto.runTask(WORKER, taskOne as string);
    expect(ranTask?.status).toBe("running");

    taskItto.finishTask(taskOne as string);
    expect(taskItto.getTask(taskOne as string)).not.toBeDefined();
  });

  it("resolve is called on finish task", () => {
    setup();
    const resolver = jest.fn();

    const taskOne = taskItto.addTask(TASK, resolver);
    const ranTask = taskItto.runTask(WORKER, taskOne as string);
    expect(ranTask?.status).toBe("running");

    taskItto.finishTask(taskOne as string);
    expect(resolver).toHaveBeenCalledWith(ranTask);
  });

  it("can register and run newTask listener", () => {
    setup();
    const newTaskListener = jest.fn();

    taskItto.addTaskListener("onAddTask", newTaskListener);

    const taskOne = taskItto.addTask(TASK);
    expect(newTaskListener).toHaveBeenCalledWith(
      taskItto.getTask(taskOne as string)
    );
  });

  it("can register and run runTask listener", () => {
    setup();
    const listener = jest.fn();

    taskItto.addTaskListener("onRunTask", listener);

    const taskOne = taskItto.addTask(TASK);
    const ranTask = taskItto.runTask(WORKER, taskOne as string);
    expect(listener).toHaveBeenCalledWith(ranTask);
  });

  it("can register and run end task listener", () => {
    setup();
    const endListener = jest.fn();

    taskItto.addTaskListener("onEndTask", endListener);

    const taskOne = taskItto.addTask(TASK);
    const ranTask = taskItto.runTask(WORKER, taskOne as string);

    taskItto.finishTask(taskOne as string);
    expect(endListener).toHaveBeenCalledWith(ranTask);
  });
});
