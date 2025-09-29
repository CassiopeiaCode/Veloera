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
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API, showError, showInfo, showSuccess, updateAPI } from '../helpers';
import { Button, Form, Modal } from '@douyinfe/semi-ui';
import Text from '@douyinfe/semi-ui/lib/es/typography/text';
import { setUserData } from '../helpers/data.js';
import { useTranslation } from 'react-i18next';
import { VALIDATION_MESSAGES } from '../utils/authConstants';

// Shared components and hooks
import { useAuthForm } from '../hooks/useAuthForm';
import { useTurnstile } from '../hooks/useTurnstile';
import AuthFormLayout from './shared/AuthFormLayout';
import ThirdPartyAuth from './shared/ThirdPartyAuth';
import WeChatLoginModal from './shared/WeChatLoginModal';
import TurnstileWrapper from './shared/TurnstileWrapper';

const LoginForm = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  // Use shared hooks
  const {
    inputs,
    handleChange,
    status,
    showWeChatLoginModal,
    setShowWeChatLoginModal,
    userDispatch,
    navigate,
    searchParams,
    processAffCode,
    onWeChatLoginClicked,
    onSubmitWeChatVerificationCode,
    onTelegramLoginClicked,
  } = useAuthForm({
    username: '',
    password: '',
    wechat_verification_code: '',
  });

  const {
    turnstileEnabled,
    turnstileSiteKey,
    turnstileToken,
    setTurnstileToken,
    validateTurnstile,
  } = useTurnstile();

  const { username, password } = inputs;

  // Process AFF code on component mount
  useEffect(() => {
    processAffCode();
  }, []);

  // Check for expired session
  useEffect(() => {
    if (searchParams.get('expired')) {
      showError(t(VALIDATION_MESSAGES.SESSION_EXPIRED));
    }
  }, [searchParams, t]);

  const handleSubmit = async (e) => {
    if (!validateTurnstile()) {
      showInfo(VALIDATION_MESSAGES.TURNSTILE_WAIT);
      return;
    }
    
    setSubmitted(true);
    if (username && password) {
      const res = await API.post(
        `/api/user/login?turnstile=${turnstileToken}`,
        {
          username,
          password,
        },
      );
      const { success, message, data } = res.data;
      if (success) {
        userDispatch({ type: 'login', payload: data });
        setUserData(data);
        updateAPI();
        showSuccess(VALIDATION_MESSAGES.LOGIN_SUCCESS);
        if (username === 'root' && password === '123456') {
          Modal.error({
            title: VALIDATION_MESSAGES.DEFAULT_PASSWORD_WARNING,
            content: VALIDATION_MESSAGES.CHANGE_DEFAULT_PASSWORD,
            centered: true,
          });
        }
        navigate(searchParams.get('returnTo') || '/app/tokens');
      } else {
        showError(message);
      }
    } else {
      showError(VALIDATION_MESSAGES.MISSING_CREDENTIALS);
    }
  };

  const handleWeChatSubmit = () => {
    onSubmitWeChatVerificationCode(turnstileToken);
  };

  return (
    <AuthFormLayout title={t('用户登录')} className="login-form-container fade-in-up">
      <Form className="beautiful-form" style={{
        background: 'var(--cute-bg-card)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '40px',
        border: '1px solid var(--cute-border-medium)',
        boxShadow: '0 16px 64px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
      }}>
        <Form.Input
          field={'username'}
          label={t('用户名/邮箱')}
          placeholder={t('用户名/邮箱')}
          name='username'
          onChange={(value) => handleChange('username', value)}
          className="custom-input fade-in delay-1 hover-lift"
          style={{
            marginBottom: '24px',
          }}
          inputStyle={{
            borderRadius: '12px',
            border: '1px solid var(--cute-border-light)',
            background: 'var(--cute-bg-secondary)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            padding: '12px 16px',
          }}
        />
        <Form.Input
          field={'password'}
          label={t('密码')}
          placeholder={t('密码')}
          name='password'
          type='password'
          onChange={(value) => handleChange('password', value)}
          className="custom-input fade-in delay-2 hover-lift"
          style={{
            marginBottom: '32px',
          }}
          inputStyle={{
            borderRadius: '12px',
            border: '1px solid var(--cute-border-light)',
            background: 'var(--cute-bg-secondary)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            padding: '12px 16px',
          }}
        />

        <Button
          theme='solid'
          style={{ 
            width: '100%',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            fontWeight: '600',
            fontSize: '16px',
            transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            position: 'relative',
            overflow: 'hidden',
          }}
          type={'primary'}
          size='large'
          htmlType={'submit'}
          onClick={handleSubmit}
          className="login-button fade-in delay-3 hover-lift"
        >
          {t('登录')}
        </Button>
      </Form>
      
      <div
        className="form-links fade-in delay-4"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '24px',
          padding: '0 20px',
        }}
      >
        <Text style={{
          color: 'var(--semi-color-text-1)',
          fontSize: '14px',
        }}>
          {t('没有账户？')}{' '}
          <Link 
            to='/register' 
            style={{
              color: 'var(--cute-purple)',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'all 0.3s ease',
            }}
            className="hover-glow"
          >
            {t('点击注册')}
          </Link>
        </Text>
        <Text style={{
          color: 'var(--semi-color-text-1)',
          fontSize: '14px',
        }}>
          {t('忘记密码？')} 
          <Link 
            to='/reset'
            style={{
              color: 'var(--cute-purple)',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'all 0.3s ease',
            }}
            className="hover-glow"
          >
            {t('点击重置')}
          </Link>
        </Text>
      </div>

      <div className="third-party-auth fade-in delay-5">
        <ThirdPartyAuth
          status={status}
          onWeChatLoginClicked={onWeChatLoginClicked}
          onTelegramLoginClicked={onTelegramLoginClicked}
        />
      </div>

      <WeChatLoginModal
        visible={showWeChatLoginModal}
        onOk={handleWeChatSubmit}
        onCancel={() => setShowWeChatLoginModal(false)}
        status={status}
        inputs={inputs}
        handleChange={handleChange}
      />

      <TurnstileWrapper
        enabled={turnstileEnabled}
        siteKey={turnstileSiteKey}
        onVerify={setTurnstileToken}
      />
    </AuthFormLayout>
  );
};

export default LoginForm;
