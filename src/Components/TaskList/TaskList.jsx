import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Input,
  Checkbox,
  Button,
  Typography,
  Empty,
  Space,
  Dropdown,
} from "antd";
import {
  StarOutlined,
  StarFilled,
  PlusOutlined,
  DeleteOutlined,
  MoreOutlined,
  CalendarOutlined,
  SunOutlined,
} from "@ant-design/icons";
import "./TaskList.css";
import TaskDetail from "../TaskDetail/TaskDetail";
import {
  addTask,
  deleteTask,
  getLists,
  toggleTaskComplete,
  toggleTaskImportant,
  updateTask,
} from "../../utils/storage";

const { Title } = Typography;

const TaskList = () => {
  const { listId } = useParams();
  const [lists, setLists] = useState([]);
  const [currentList, setCurrentList] = useState(null);
  const [newTaskText, setNewTaskText] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    loadLists();
  }, [listId]);

  // Dispatch custom event when lists change to notify sidebar
  useEffect(() => {
    window.dispatchEvent(new Event('listsUpdated'));
  }, [lists]);

  const loadLists = () => {
    const storedLists = getLists();
    setLists(storedLists);
    const list = storedLists.find((l) => l.id === listId);
    setCurrentList(list);
  };

  const handleAddTask = () => {
    if (newTaskText.trim() && listId) {
      addTask(listId, newTaskText);
      setNewTaskText("");
      loadLists();
    }
  };

  const handleToggleComplete = (taskId, e) => {
    if (e) {
      e.stopPropagation();
    }
    toggleTaskComplete(listId, taskId);
    loadLists();
    // Update selected task if it's the one being toggled
    if (selectedTask?.id === taskId) {
      const updatedList = getLists().find((l) => l.id === listId);
      const updatedTask = updatedList?.tasks.find((t) => t.id === taskId);
      if (updatedTask) {
        setSelectedTask(updatedTask);
      }
    }
  };

  const handleToggleImportant = (taskId) => {
    toggleTaskImportant(listId, taskId);
    loadLists();
  };

  const handleDeleteTask = (taskId) => {
    deleteTask(listId, taskId);
    if (selectedTask?.id === taskId) {
      setShowDetail(false);
      setSelectedTask(null);
    }
    loadLists();
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedTask(null);
  };

  const handleUpdateTask = (taskId, updates) => {
    updateTask(listId, taskId, updates);
    loadLists();
    if (selectedTask?.id === taskId) {
      setSelectedTask({ ...selectedTask, ...updates });
    }
  };

  const getTaskMenuItems = (taskId) => [
    {
      key: "delete",
      label: "Delete task",
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDeleteTask(taskId),
    },
  ];

  if (!currentList) {
    return (
      <div className="task-list-container">
        <Empty description="List not found" />
      </div>
    );
  }

  const incompleteTasks = currentList.tasks?.filter((t) => !t.completed) || [];
  const completedTasks = currentList.tasks?.filter((t) => t.completed) || [];

  return (
    <div className="task-list-layout">
      <div className={`task-list-container ${showDetail ? "with-detail" : ""}`}>
        <div className="task-list-header">
          <Title level={2} className="list-title">
            {currentList.name}
          </Title>
          <div className="task-count">
            {currentList.tasks?.length || 0} tasks
          </div>
        </div>

        <div className="task-input-container">
          <Input
            placeholder="Add a task"
            prefix={<PlusOutlined />}
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onPressEnter={handleAddTask}
            className="task-input"
            size="large"
          />
        </div>

        <div className="tasks-container">
          {incompleteTasks.length === 0 && completedTasks.length === 0 ? (
            <Empty
              description="No tasks yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className="empty-state"
            />
          ) : (
            <>
              {incompleteTasks.map((task) => (
                <div
                  key={task.id}
                  className={`task-item ${
                    selectedTask?.id === task.id ? "selected" : ""
                  }`}
                  onClick={() => handleTaskClick(task)}
                >
                  <Checkbox
                    checked={task.completed}
                    onChange={(e) => handleToggleComplete(task.id, e)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="task-content">
                    <div className="task-text">{task.text}</div>
                    {(task.myDay || task.dueDate) && (
                      <div className="task-meta">
                        {task.myDay && (
                          <span className="meta-item">
                            <SunOutlined /> My Day
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="meta-item">
                            <CalendarOutlined /> {task.dueDate}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <Space className="task-actions">
                    <Button
                      type="text"
                      icon={
                        task.important ? (
                          <StarFilled style={{ color: "#ff4d4f" }} />
                        ) : (
                          <StarOutlined />
                        )
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleImportant(task.id);
                      }}
                    />
                    <Dropdown
                      menu={{ items: getTaskMenuItems(task.id) }}
                      trigger={["click"]}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>
                  </Space>
                </div>
              ))}

              {completedTasks.length > 0 && (
                <>
                  <div className="completed-section-header">
                    Completed {completedTasks.length}
                  </div>
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`task-item completed ${
                        selectedTask?.id === task.id ? "selected" : ""
                      }`}
                      onClick={() => handleTaskClick(task)}
                    >
                      <Checkbox
                        checked={task.completed}
                        onChange={(e) => handleToggleComplete(task.id, e)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="task-content">
                        <div className="task-text">{task.text}</div>
                      </div>
                      <Space className="task-actions">
                        <Button
                          type="text"
                          icon={
                            task.important ? (
                              <StarFilled style={{ color: "#ff4d4f" }} />
                            ) : (
                              <StarOutlined />
                            )
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleImportant(task.id);
                          }}
                        />
                        <Dropdown
                          menu={{ items: getTaskMenuItems(task.id) }}
                          trigger={["click"]}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button type="text" icon={<MoreOutlined />} />
                        </Dropdown>
                      </Space>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {showDetail && selectedTask && (
        <TaskDetail
          task={selectedTask}
          listId={listId}
          onClose={handleCloseDetail}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
};

export default TaskList;