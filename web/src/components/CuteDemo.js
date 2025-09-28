import React from 'react';
import { Card, Button, Tag, Progress, Notification } from '@douyinfe/semi-ui';
import './CuteDemo.scss';

const CuteDemo = () => {
  const showNotification = (type) => {
    Notification[type]({
      title: '可爱通知 ✨',
      content: '这是一个超级可爱的通知消息！',
      duration: 3,
    });
  };

  return (
    <div className="cute-demo-container">
      <Card 
        title="🎀 可爱组件演示" 
        className="cute-hover-float cute-glow"
        style={{ marginBottom: '20px' }}
      >
        <div className="cute-content">
          <h3 className="cute-title cute-sparkle">欢迎来到可爱世界！ 🌈</h3>
          
          <div className="cute-buttons-section">
            <h4>✨ 魔法按钮</h4>
            <Button 
              type="primary" 
              className="cute-hover-heartbeat cute-magical"
              onClick={() => showNotification('success')}
            >
              成功按钮 🌟
            </Button>
            
            <Button 
              type="secondary" 
              className="cute-hover-wiggle cute-dreamy"
              onClick={() => showNotification('info')}
            >
              信息按钮 💫
            </Button>
            
            <Button 
              type="warning" 
              className="cute-playful"
              onClick={() => showNotification('warning')}
            >
              警告按钮 ⚠️
            </Button>
            
            <Button 
              type="danger" 
              className="cute-pulse"
              onClick={() => showNotification('error')}
            >
              错误按钮 💔
            </Button>
          </div>
          
          <div className="cute-tags-section">
            <h4>🏷️ 可爱标签</h4>
            <Tag color="pink" className="cute-float cute-delay-1">粉色标签</Tag>
            <Tag color="purple" className="cute-jump cute-delay-2">紫色标签</Tag>
            <Tag color="blue" className="cute-bubble cute-delay-3">蓝色标签</Tag>
            <Tag color="green" className="cute-rotate cute-delay-4">绿色标签</Tag>
            <Tag color="orange" className="cute-wave cute-delay-5">橙色标签</Tag>
          </div>
          
          <div className="cute-progress-section">
            <h4>📊 魔法进度条</h4>
            <Progress percent={30} className="cute-hover-float" />
            <Progress percent={60} className="cute-glow" />
            <Progress percent={90} className="cute-rainbow" />
          </div>
          
          <div className="cute-cards-section">
            <h4>🎴 迷你卡片</h4>
            <div className="cute-mini-cards">
              <Card 
                className="cute-mini-card cute-float cute-delay-1"
                bodyStyle={{ padding: '15px' }}
              >
                <div className="cute-card-content">
                  <span className="cute-emoji">🦄</span>
                  <span>独角兽</span>
                </div>
              </Card>
              
              <Card 
                className="cute-mini-card cute-jump cute-delay-2"
                bodyStyle={{ padding: '15px' }}
              >
                <div className="cute-card-content">
                  <span className="cute-emoji">🌸</span>
                  <span>樱花</span>
                </div>
              </Card>
              
              <Card 
                className="cute-mini-card cute-pulse cute-delay-3"
                bodyStyle={{ padding: '15px' }}
              >
                <div className="cute-card-content">
                  <span className="cute-emoji">🍭</span>
                  <span>糖果</span>
                </div>
              </Card>
              
              <Card 
                className="cute-mini-card cute-sparkle cute-delay-4"
                bodyStyle={{ padding: '15px' }}
              >
                <div className="cute-card-content">
                  <span className="cute-emoji">🎈</span>
                  <span>气球</span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CuteDemo;