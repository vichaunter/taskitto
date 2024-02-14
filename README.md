# TaskItto

TaskItto enables you to have a queue of tasks that can be executed by multiple runners concurrently, when you want to limit them to a specific number of simultaneous number of tasks.

### Motivation

The need of manage a network of services that will perform a task, and not be able to find a fitting solution.

### What is not

Is not a task executor, this queue holds the tasks, the listeners and what you want to do (if any) after the task finish, and enables you to ask for tasks, and finish them.

So you still need a service that will get the available task, and notify when is finished. The idea behind is to have an api that gives you the info for the next task to be performed, and you can have n runners asking for what to do constantly. So you only need to drop tasks inside and the tasks will notify when the signal of finish is called.

This way you can wait for the tasks, or have a notification, for example refreshing the ui.


## Where to start

Easy peasy, it is in npm so you can just install it and use it:

´´´
pnpm install taskitto

yarn add taskitto


import TaskItto from 'taskitto'

const taskItto = new TaskItto()

taskItto.addTask(...)
´´´

## Contributions?

Any improvement you want to suggest is welcome

There is some tests to ensure the functionality but feel free to suggest missing ones.