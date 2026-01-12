export const getLists = () => {
  const lists = localStorage.getItem('todoLists');
  return lists ? JSON.parse(lists) : getDefaultLists();
};

const getDefaultLists = () => {
  return [
    { id: 'my-day', name: 'My Day', icon: 'sun', tasks: [], type: 'default' },
    { id: 'important', name: 'Important', icon: 'star', tasks: [], type: 'default' },
    { id: 'planned', name: 'Planned', icon: 'calendar', tasks: [], type: 'default' },
    { id: 'assigned-to-me', name: 'Assigned to me', icon: 'user', tasks: [], type: 'default' },
    { id: 'tasks', name: 'Tasks', icon: 'home', tasks: [], type: 'default' }
  ];
};

export const saveLists = (lists) => {
  localStorage.setItem('todoLists', JSON.stringify(lists));
};

const syncSpecialLists = (lists) => {  const myDayList = lists.find(l => l.id === 'my-day');
  const importantList = lists.find(l => l.id === 'important');
  const plannedList = lists.find(l => l.id === 'planned');
  
  if (myDayList) myDayList.tasks = [];
  if (importantList) importantList.tasks = [];
  if (plannedList) plannedList.tasks = [];
  
  lists.forEach(list => {
    if (list.id !== 'my-day' && list.id !== 'important' && list.id !== 'planned') {
      list.tasks.forEach(task => {
        if (task.myDay && myDayList) {
          myDayList.tasks.push({ ...task, sourceListId: list.id });
        }
        if (task.important && importantList) {
          importantList.tasks.push({ ...task, sourceListId: list.id });
        }
        if (task.dueDate && plannedList) {
          plannedList.tasks.push({ ...task, sourceListId: list.id });
        }
      });
    }
  });
};

export const addList = (listName) => {
  const lists = getLists();
  const newList = {
    id: Date.now().toString(),
    name: listName,
    icon: 'list',
    tasks: [],
    type: 'custom'
  };
  lists.push(newList);
  saveLists(lists);
  return newList;
};

export const deleteList = (listId) => {
  const lists = getLists();
  const updatedLists = lists.filter(list => list.id !== listId);
  saveLists(updatedLists);
};

export const addTask = (listId, taskText) => {
  const lists = getLists();
  
  let targetListId = listId;
  const newTask = {
    id: Date.now().toString(),
    text: taskText,
    completed: false,
    important: false,
    myDay: false,
    dueDate: null,
    note: '',
    createdAt: new Date().toISOString()
  };
  
  if (listId === 'my-day') {
    targetListId = 'tasks';
    newTask.myDay = true;
  } else if (listId === 'important') {
    targetListId = 'tasks';
    newTask.important = true;
  } else if (listId === 'planned') {
    targetListId = 'tasks';
    newTask.dueDate = new Date().toISOString().split('T')[0]; // Set today's date
  }
  
  const list = lists.find(l => l.id === targetListId);
  if (list) {
    list.tasks.push(newTask);
    syncSpecialLists(lists);
    saveLists(lists);
    return newTask;
  }
};

export const updateTask = (listId, taskId, updates) => {
  const lists = getLists();
  
  let sourceListId = listId;
  const currentList = lists.find(l => l.id === listId);
  
  if (currentList && ['my-day', 'important', 'planned'].includes(listId)) {
    const task = currentList.tasks.find(t => t.id === taskId);
    if (task && task.sourceListId) {
      sourceListId = task.sourceListId;
    }
  }
  
  const list = lists.find(l => l.id === sourceListId);
  if (list) {
    const taskIndex = list.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      list.tasks[taskIndex] = { ...list.tasks[taskIndex], ...updates };
      syncSpecialLists(lists);
      saveLists(lists);
    }
  }
};

export const deleteTask = (listId, taskId) => {
  const lists = getLists();
  
  // Find the source list (if coming from special list)
  let sourceListId = listId;
  const currentList = lists.find(l => l.id === listId);
  
  if (currentList && ['my-day', 'important', 'planned'].includes(listId)) {
    const task = currentList.tasks.find(t => t.id === taskId);
    if (task && task.sourceListId) {
      sourceListId = task.sourceListId;
    }
  }
  
  const list = lists.find(l => l.id === sourceListId);
  if (list) {
    list.tasks = list.tasks.filter(t => t.id !== taskId);
    syncSpecialLists(lists);
    saveLists(lists);
  }
};

export const toggleTaskComplete = (listId, taskId) => {
  const lists = getLists();
  
  // Find the source list (if coming from special list)
  let sourceListId = listId;
  const currentList = lists.find(l => l.id === listId);
  
  if (currentList && ['my-day', 'important', 'planned'].includes(listId)) {
    const task = currentList.tasks.find(t => t.id === taskId);
    if (task && task.sourceListId) {
      sourceListId = task.sourceListId;
    }
  }
  
  const list = lists.find(l => l.id === sourceListId);
  if (list) {
    const task = list.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      syncSpecialLists(lists);
      saveLists(lists);
    }
  }
};

export const toggleTaskImportant = (listId, taskId) => {
  const lists = getLists();
  
  // Find the source list (if coming from special list)
  let sourceListId = listId;
  const currentList = lists.find(l => l.id === listId);
  
  if (currentList && ['my-day', 'important', 'planned'].includes(listId)) {
    const task = currentList.tasks.find(t => t.id === taskId);
    if (task && task.sourceListId) {
      sourceListId = task.sourceListId;
    }
  }
  
  const list = lists.find(l => l.id === sourceListId);
  if (list) {
    const task = list.tasks.find(t => t.id === taskId);
    if (task) {
      task.important = !task.important;
      syncSpecialLists(lists);
      saveLists(lists);
    }
  }
};