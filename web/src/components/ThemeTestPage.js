/*
夜间模式和美化效果测试页面
*/
import React from 'react';
import { Card, Button, Input, Banner, Switch, Typography } from '@douyinfe/semi-ui';
import { useTheme, useSetTheme } from '../../context/Theme';

const { Title, Text } = Typography;

const ThemeTestPage = () => {
  const theme = useTheme();
  const setTheme = useSetTheme();

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card 
        title={<Title heading={2} className="gradient-text">主题测试页面</Title>}
        className="glass-effect hover-lift"
        style={{ marginBottom: '24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <Text>当前主题: {theme === 'dark' ? '🌙 夜间模式' : '🌞 日间模式'}</Text>
          <Switch
            checked={theme === 'dark'}
            onChange={(checked) => setTheme(checked)}
            checkedText="🌞"
            uncheckedText="🌙"
            className="theme-switch"
          />
        </div>
        
        <Banner
          type="info"
          description="这是一个信息横幅，用于测试夜间模式下的显示效果"
          style={{ marginBottom: '16px' }}
        />
        
        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <Card title="测试卡片 1" className="hover-scale">
            <Text>这是第一个测试卡片的内容</Text>
            <Button theme="solid" type="primary" style={{ marginTop: '12px' }}>
              主要按钮
            </Button>
          </Card>
          
          <Card title="测试卡片 2" className="hover-glow">
            <Text>这是第二个测试卡片的内容</Text>
            <Button theme="solid" type="secondary" style={{ marginTop: '12px' }}>
              次要按钮
            </Button>
          </Card>
        </div>
        
        <div style={{ marginTop: '24px' }}>
          <Text strong>输入框测试:</Text>
          <Input 
            placeholder="请输入测试内容..." 
            style={{ marginTop: '8px' }}
          />
        </div>
      </Card>
    </div>
  );
};

export default ThemeTestPage;