/*
Copyright (c) 2025 Tethys Plex

This file is part of Veloera.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
*/
import React, { useContext, useEffect, useState } from 'react';
import { Banner, Card, Col, Row } from '@douyinfe/semi-ui';
import { API, showError, showNotice, timestamp2string } from '../../helpers';
import { StatusContext } from '../../context/Status';
import { marked } from 'marked';
import { StyleContext } from '../../context/Style/index.js';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t, i18n } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [styleState, styleDispatch] = useContext(StyleContext);

  const displayNotice = async () => {
    const res = await API.get('/api/notice');
    const { success, message, data } = res.data;
    if (success) {
      let oldNotice = localStorage.getItem('notice');
      if (data !== oldNotice && data !== '') {
        const htmlNotice = marked(data);
        showNotice(htmlNotice, true);
        localStorage.setItem('notice', data);
      }
    } else {
      showError(message);
    }
  };

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://') && !data.startsWith('<!DOCTYPE')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);

      // 如果内容是 URL，则发送主题模式
      if (data.startsWith('https://')) {
        const iframe = document.querySelector('iframe');
        if (iframe) {
          const theme = localStorage.getItem('theme-mode') || 'light';
          // 测试是否正确传递theme-mode给iframe
          // console.log('Sending theme-mode to iframe:', theme);
          iframe.onload = () => {
            iframe.contentWindow.postMessage({ themeMode: theme }, '*');
            iframe.contentWindow.postMessage({ lang: i18n.language }, '*');
          };
        }
      }
    } else {
      showError(message);
      setHomePageContent('加载首页内容失败...');
    }
    setHomePageContentLoaded(true);
  };

  const getStartTimeString = () => {
    const timestamp = statusState?.status?.start_time;
    return statusState.status ? timestamp2string(timestamp) : '';
  };

  useEffect(() => {
    displayNotice().then();
    displayHomePageContent().then();
  }, []);

  return (
    <div className="home-container fade-in-up">
      {/* Warning banner for chat content logging */}
      {statusState?.status?.log_chat_content_enabled && (
        <Banner
          type="warning"
          description="此站点管理员可查看您的对话内容"
          className="fade-in-down delay-1 hover-lift"
          style={{
            margin: '0 0 24px 0',
            borderRadius: '16px',
            background: 'rgba(255, 193, 7, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            boxShadow: '0 8px 32px rgba(255, 193, 7, 0.1)',
          }}
        />
      )}
      {homePageContentLoaded && homePageContent === '' ? (
        <>
          <Card
            bordered={false}
            headerLine={false}
            title={
              <span className="card-title-gradient">
                {t('系统状况')}
              </span>
            }
            className="main-card fade-in-up delay-2 hover-lift"
            bodyStyle={{ 
              padding: '24px', 
              background: 'transparent'
            }}
            style={{
              marginBottom: '24px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 12px 48px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div 
              className="card-background-pattern"
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '200px',
                height: '200px',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                borderRadius: '50%',
                transform: 'translate(50%, -50%)',
                pointerEvents: 'none',
              }}
            />
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Card
                  title={
                    <span style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 600,
                    }}>
                      {t('系统信息')}
                    </span>
                  }
                  className="info-card fade-in-right delay-3 hover-scale"
                  headerExtraContent={
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'var(--semi-color-text-2)',
                        background: 'rgba(102, 126, 234, 0.1)',
                        padding: '4px 8px',
                        borderRadius: '8px',
                      }}
                    >
                      {t('系统信息总览')}
                    </span>
                  }
                  style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    transition: 'all 0.3s ease',
                  }}
                  bodyStyle={{ 
                    background: 'transparent',
                    padding: '20px',
                  }}
                >
                  <div className="info-item-container">
                    <p className="info-item fade-in delay-4">
                      <span className="info-label">{t('名称')}：</span>
                      <span className="info-value">{statusState?.status?.system_name}</span>
                    </p>
                    <p className="info-item fade-in delay-5">
                      <span className="info-label">{t('版本')}：</span>
                      <span className="info-value version-badge">
                        {statusState?.status?.version
                          ? statusState?.status?.version
                          : 'unknown'}
                      </span>
                    </p>
                    <p className="info-item fade-in delay-6">
                      <span className="info-label">{t('源码')}：</span>
                      <a
                        href='https://github.com/Veloera/Veloera'
                        target='_blank'
                        rel='noreferrer'
                        className="info-link hover-glow"
                        style={{
                          color: '#667eea',
                          textDecoration: 'none',
                          fontWeight: 500,
                          transition: 'all 0.3s ease',
                        }}
                      >
                        https://github.com/Veloera/Veloera
                      </a>
                    </p>
                    
                    <p className="info-item fade-in delay-7">
                      <span className="info-label">{t('协议')}：</span>
                      <a
                        href='https://www.apache.org/licenses/LICENSE-2.0'
                        target='_blank'
                        rel='noreferrer'
                        className="info-link hover-glow"
                        style={{
                          color: '#667eea',
                          textDecoration: 'none',
                          fontWeight: 500,
                          transition: 'all 0.3s ease',
                        }}
                      >
                        GNU GPL v3-or-later
                      </a>
                    </p>
                    <p className="info-item fade-in delay-8">
                      <span className="info-label">{t('启动时间')}：</span>
                      <span className="info-value">{getStartTimeString()}</span>
                    </p>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  title={t('系统配置')}
                  headerExtraContent={
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'var(--semi-color-text-1)',
                      }}
                    >
                      {t('系统配置总览')}
                    </span>
                  }
                >
                  <p>
                    {t('邮箱验证')}：
                    {statusState?.status?.email_verification === true
                      ? t('已启用')
                      : t('未启用')}
                  </p>
                  <p>
                    {t('GitHub 身份验证')}：
                    {statusState?.status?.github_oauth === true
                      ? t('已启用')
                      : t('未启用')}
                  </p>
                  <p>
                    {t('OIDC 身份验证')}：
                    {statusState?.status?.oidc === true
                      ? t('已启用')
                      : t('未启用')}
                  </p>
                  <p>
                    {t('微信身份验证')}：
                    {statusState?.status?.wechat_login === true
                      ? t('已启用')
                      : t('未启用')}
                  </p>
                  <p>
                    {t('Turnstile 用户校验')}：
                    {statusState?.status?.turnstile_check === true
                      ? t('已启用')
                      : t('未启用')}
                  </p>
                  <p>
                    {t('Telegram 身份验证')}：
                    {statusState?.status?.telegram_oauth === true
                      ? t('已启用')
                      : t('未启用')}
                  </p>
                  <p>
                    {t('Linux DO 身份验证')}：
                    {statusState?.status?.linuxdo_oauth === true
                      ? t('已启用')
                      : t('未启用')}
                  </p>
                </Card>
              </Col>
            </Row>
          </Card>
        </>
      ) : (
        <>
          {homePageContent.startsWith('https://') ? (
            <iframe
              src={homePageContent}
              style={{ width: '100%', height: '100vh', border: 'none' }}
            />
          ) : homePageContent.trim().startsWith('<!DOCTYPE') ? (
            <iframe
              srcDoc={homePageContent}
              style={{ width: '100%', height: '100vh', border: 'none' }}
            />
          ) : (
            <div
              style={{ fontSize: 'larger' }}
              dangerouslySetInnerHTML={{ __html: homePageContent }}
            ></div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
