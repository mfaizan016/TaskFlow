import { useState, useEffect } from "react";
import { Layout, Menu, Input, Button, Modal } from "antd";
import {
  SunOutlined,
  StarOutlined,
  CalendarOutlined,
  UserOutlined,
  HomeOutlined,
  UnorderedListOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";
import logo from "./logo.png";
import { addList, deleteList, getLists } from "../../utils/storage";

const { Sider } = Layout;

const Sidebar = () => {
  const [lists, setLists] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadLists();

    // Listen for list updates from other components
    const handleListsUpdate = () => {
      loadLists();
    };

    window.addEventListener("listsUpdated", handleListsUpdate);

    return () => {
      window.removeEventListener("listsUpdated", handleListsUpdate);
    };
  }, []);

  const loadLists = () => {
    const storedLists = getLists();
    setLists(storedLists);
  };

  const getIcon = (iconName) => {
    const icons = {
      sun: <SunOutlined />,
      star: <StarOutlined />,
      calendar: <CalendarOutlined />,
      user: <UserOutlined />,
      home: <HomeOutlined />,
      list: <UnorderedListOutlined />,
    };
    return icons[iconName] || <UnorderedListOutlined />;
  };

  const handleMenuClick = (e) => {
    navigate(`/list/${e.key}`);
  };

  const handleAddList = () => {
    if (newListName.trim()) {
      addList(newListName);
      setNewListName("");
      setIsModalOpen(false);
      loadLists();
      window.dispatchEvent(new Event("listsUpdated"));
    }
  };

  const handleDeleteList = (listId, e) => {
    e.stopPropagation();
    Modal.confirm({
      title: "Delete this list?",
      content: "All tasks in this list will be permanently deleted.",
      okText: "Delete",
      okType: "danger",
      onOk: () => {
        deleteList(listId);
        loadLists();
        window.dispatchEvent(new Event("listsUpdated"));
        if (location.pathname === `/list/${listId}`) {
          navigate("/list/tasks");
        }
      },
    });
  };

  const defaultItems = lists
    .filter((list) => list.type === "default")
    .map((list) => ({
      key: list.id,
      icon: getIcon(list.icon),
      label: list.name,
      count: list.tasks?.length || 0,
    }));

  const customItems = lists
    .filter((list) => list.type === "custom")
    .map((list) => ({
      key: list.id,
      icon: getIcon(list.icon),
      label: (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <span>{list.name}</span>
          <div>
            {list.tasks?.length > 0 && (
              <span className="task-count" style={{marginRight: 5}}>{list.tasks.length}</span>
            )}
            <DeleteOutlined
              onClick={(e) => handleDeleteList(list.id, e)}
              style={{ fontSize: "12px", opacity: 0.6 }}
            />
          </div>
        </div>
      ),
    }));

  const selectedKey = location.pathname.split("/")[2] || "tasks";

  return (
    <>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={280}
        className="sidebar"
      >
        <div className="sidebar-header">
          <div className="logo-container">
            <img
              src={logo}
              alt="App Logo"
              className="app-logo"
              style={{ width: 43, height: 50 }}
            />
          </div>
          <div className="app_name">
            {!collapsed && <h1>TASKFLOW</h1>}
          </div>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          className="sidebar-menu"
        >
          {defaultItems.map((item) => (
            <Menu.Item key={item.key} icon={item.icon}>
              <span className="menu-label">{item.label}</span>
              {item.count > 0 && (
                <span className="task-count">{item.count}</span>
              )}
            </Menu.Item>
          ))}

          {customItems.length > 0 && <Menu.Divider />}

          {customItems.map((item) => (
            <Menu.Item key={item.key} icon={item.icon}>
              {item.label}
              {item.count > 0 && (
                <span className="task-count">{item.count}</span>
              )}
            </Menu.Item>
          ))}
        </Menu>

        <div className="sidebar-footer">
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            block
          >
            {!collapsed && "New list"}
          </Button>
        </div>
      </Sider>

      <Modal
        title="Create new list"
        open={isModalOpen}
        onOk={handleAddList}
        onCancel={() => {
          setIsModalOpen(false);
          setNewListName("");
        }}
        okText="Create"
      >
        <Input
          style={{ color: "black" }}
          placeholder="Enter list name"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          onPressEnter={handleAddList}
          autoFocus
        />
      </Modal>
    </>
  );
};

export default Sidebar;
