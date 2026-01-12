import { useState, useEffect } from 'react';
import { Button, Input, DatePicker, Space, Divider } from 'antd';
import { 
  CloseOutlined, 
  StarOutlined, 
  StarFilled,
  SunOutlined,
  CalendarOutlined,
  FileTextOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './TaskDetail.css';

const { TextArea } = Input;

const TaskDetail = ({ task, onClose, onUpdate, onDelete }) => {
  const [note, setNote] = useState(task.note || '');
  const [dueDate, setDueDate] = useState(task.dueDate ? dayjs(task.dueDate) : null);

  useEffect(() => {
    setNote(task.note || '');
    setDueDate(task.dueDate ? dayjs(task.dueDate) : null);
  }, [task]);

  const handleNoteChange = (e) => {
    const value = e.target.value;
    setNote(value);
    onUpdate(task.id, { note: value });
  };

  const handleDateChange = (date) => {
    const dateString = date ? date.format('YYYY-MM-DD') : null;
    setDueDate(date);
    onUpdate(task.id, { dueDate: dateString });
  };

  const handleToggleMyDay = () => {
    onUpdate(task.id, { myDay: !task.myDay });
  };

  const handleToggleImportant = () => {
    onUpdate(task.id, { important: !task.important });
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(task.id);
    }
  };

  return (
    <div className="task-detail-panel">
      <div className="task-detail-header">
        <Button 
          type="text" 
          icon={<CloseOutlined />} 
          onClick={onClose}
          className="close-btn"
        />
      </div>

      <div className="task-detail-content">
        <div className="task-detail-title">
          <div className="task-title-text">{task.text}</div>
          <Button
            type="text"
            icon={task.important ? <StarFilled style={{ color: '#ff4d4f' }} /> : <StarOutlined />}
            onClick={handleToggleImportant}
            size="large"
          />
        </div>

        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div className="detail-section">
            <Button
              type="text"
              icon={<SunOutlined />}
              onClick={handleToggleMyDay}
              className={`action-btn ${task.myDay ? 'active' : ''}`}
              block
            >
              {task.myDay ? 'Added to My Day' : 'Add to My Day'}
            </Button>
          </div>

          <div className="detail-section">
            <div className="section-label">
              <CalendarOutlined /> Due date
            </div>
            <DatePicker
              className='custom-date-picker'
              value={dueDate}
              onChange={handleDateChange}
              style={{ width: '100%' }}
              placeholder="Set due date"
              format="MMMM DD, YYYY"
            />
          </div>

          <Divider style={{ background: 'rgba(255,255,255,0.1)', margin: '16px 0' }} />

          <div className="detail-section">
            <div className="section-label">
              <FileTextOutlined /> Notes
            </div>
            <TextArea
              value={note}
              onChange={handleNoteChange}
              placeholder="Add notes"
              autoSize={{ minRows: 4, maxRows: 10 }}
              className="notes-textarea"
            />
          </div>

          <Divider style={{ background: 'rgba(255,255,255,0.1)', margin: '16px 0' }} />

          <div className="detail-section">
            <div className="created-date">
              Created on {new Date(task.createdAt).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
          </div>
        </Space>
      </div>

      <div className="task-detail-footer">
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={handleDelete}
          block
        >
          Delete task
        </Button>
      </div>
    </div>
  );
};

export default TaskDetail;