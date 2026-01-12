import { Layout } from 'antd';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import TaskList from '../TaskList/TaskList';


const { Content } = Layout;

const MainLayout = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Content className="main-content" style={{background: "#2d2d2d", minHeight: "100vh"}}>
          <Routes>
            <Route path="/" element={<Navigate to="/list/tasks" replace />} />
            <Route path="/list/:listId" element={<TaskList />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;