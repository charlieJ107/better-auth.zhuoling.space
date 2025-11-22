import type { EmailTemplate, EmailTemplateData, OTPTemplateData } from './types';

// Email Verification Templates
export const emailVerificationTemplates: Record<string, (data: EmailTemplateData) => EmailTemplate> = {
  en: (data: EmailTemplateData) => ({
    subject: `Verify your ${data.appName} account email`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your ${data.appName} account email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
          .content { padding: 20px 0; }
          .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${data.appName}</h1>
        </div>
        <div class="content">
          <h2>Welcome to ${data.appName}!</h2>
          <p>Hello${data.userName ? ` ${data.userName}` : ''},</p>
          <p>Thank you for signing up for ${data.appName}. Please click the button below to verify your email address:</p>
          <a href="${data.url}" class="button">Verify Email Address</a>
          <p>If the button doesn't work, please copy and paste the following link into your browser:</p>
          <p><a href="${data.url}">${data.url}</a></p>
          <p>This link will expire in 24 hours.</p>
        </div>
        <div class="footer">
          <p>If you didn't create this account, please ignore this email.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </body>
      </html>
    `,
    text: `Welcome to ${data.appName}!\n\nHello${data.userName ? ` ${data.userName}` : ''},\n\nThank you for signing up for ${data.appName}. Please click the following link to verify your email address:\n\n${data.url}\n\nThis link will expire in 24 hours.\n\nIf you didn't create this account, please ignore this email.`
  }),

  zh: (data: EmailTemplateData) => ({
    subject: `验证您的 ${data.appName} 账户邮箱`,
    html: `
      <!DOCTYPE html>
      <html lang="zh">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>验证您的 ${data.appName} 账户邮箱</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
          .content { padding: 20px 0; }
          .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${data.appName}</h1>
        </div>
        <div class="content">
          <h2>欢迎使用 ${data.appName}！</h2>
          <p>您好${data.userName ? ` ${data.userName}` : ''}，</p>
          <p>感谢您注册 ${data.appName} 账户。请点击下面的按钮验证您的邮箱地址：</p>
          <a href="${data.url}" class="button">验证邮箱地址</a>
          <p>如果按钮无法点击，请复制以下链接到浏览器中打开：</p>
          <p><a href="${data.url}">${data.url}</a></p>
          <p>此链接将在24小时后过期。</p>
        </div>
        <div class="footer">
          <p>如果您没有创建此账户，请忽略此邮件。</p>
          <p>此邮件由系统自动发送，请勿回复。</p>
        </div>
      </body>
      </html>
    `,
    text: `欢迎使用 ${data.appName}！\n\n您好${data.userName ? ` ${data.userName}` : ''}，\n\n感谢您注册 ${data.appName} 账户。请点击以下链接验证您的邮箱地址：\n\n${data.url}\n\n此链接将在24小时后过期。\n\n如果您没有创建此账户，请忽略此邮件。`
  })
};

// Password Reset Templates
export const passwordResetTemplates: Record<string, (data: EmailTemplateData) => EmailTemplate> = {
  en: (data: EmailTemplateData) => ({
    subject: `Reset your ${data.appName} account password`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset your ${data.appName} account password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
          .content { padding: 20px 0; }
          .button { display: inline-block; background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
          .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${data.appName}</h1>
        </div>
        <div class="content">
          <h2>Password Reset Request</h2>
          <p>Hello${data.userName ? ` ${data.userName}` : ''},</p>
          <p>We received a request to reset the password for your ${data.appName} account. Please click the button below to reset your password:</p>
          <a href="${data.url}" class="button">Reset Password</a>
          <p>If the button doesn't work, please copy and paste the following link into your browser:</p>
          <p><a href="${data.url}">${data.url}</a></p>
          <div class="warning">
            <p><strong>Security Notice:</strong></p>
            <p>• This link will expire in 1 hour</p>
            <p>• If you didn't request a password reset, please ignore this email</p>
            <p>• Your password won't be changed unless you click the link above</p>
          </div>
        </div>
        <div class="footer">
          <p>If you didn't request a password reset, please ignore this email.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </body>
      </html>
    `,
    text: `Password Reset Request\n\nHello${data.userName ? ` ${data.userName}` : ''},\n\nWe received a request to reset the password for your ${data.appName} account. Please click the following link to reset your password:\n\n${data.url}\n\nSecurity Notice:\n• This link will expire in 1 hour\n• If you didn't request a password reset, please ignore this email\n• Your password won't be changed unless you click the link above\n\nIf you didn't request a password reset, please ignore this email.`
  }),

  zh: (data: EmailTemplateData) => ({
    subject: `重置您的 ${data.appName} 账户密码`,
    html: `
      <!DOCTYPE html>
      <html lang="zh">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>重置您的 ${data.appName} 账户密码</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
          .content { padding: 20px 0; }
          .button { display: inline-block; background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
          .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${data.appName}</h1>
        </div>
        <div class="content">
          <h2>密码重置请求</h2>
          <p>您好${data.userName ? ` ${data.userName}` : ''}，</p>
          <p>我们收到了重置您 ${data.appName} 账户密码的请求。请点击下面的按钮重置您的密码：</p>
          <a href="${data.url}" class="button">重置密码</a>
          <p>如果按钮无法点击，请复制以下链接到浏览器中打开：</p>
          <p><a href="${data.url}">${data.url}</a></p>
          <div class="warning">
            <p><strong>安全提醒：</strong></p>
            <p>• 此链接将在1小时后过期</p>
            <p>• 如果您没有请求重置密码，请忽略此邮件</p>
            <p>• 您的密码不会被更改，除非您点击上面的链接</p>
          </div>
        </div>
        <div class="footer">
          <p>如果您没有请求重置密码，请忽略此邮件。</p>
          <p>此邮件由系统自动发送，请勿回复。</p>
        </div>
      </body>
      </html>
    `,
    text: `密码重置请求\n\n您好${data.userName ? ` ${data.userName}` : ''}，\n\n我们收到了重置您 ${data.appName} 账户密码的请求。请点击以下链接重置您的密码：\n\n${data.url}\n\n安全提醒：\n• 此链接将在1小时后过期\n• 如果您没有请求重置密码，请忽略此邮件\n• 您的密码不会被更改，除非您点击上面的链接\n\n如果您没有请求重置密码，请忽略此邮件。`
  })
};

// Magic Link Templates
export const magicLinkTemplates: Record<string, (data: EmailTemplateData) => EmailTemplate> = {
  en: (data: EmailTemplateData) => ({
    subject: `Your ${data.appName} login link`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your ${data.appName} login link</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
          .content { padding: 20px 0; }
          .button { display: inline-block; background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${data.appName}</h1>
        </div>
        <div class="content">
          <h2>Login Link</h2>
          <p>Hello${data.userName ? ` ${data.userName}` : ''},</p>
          <p>You requested a login link for ${data.appName}. Please click the button below to log in:</p>
          <a href="${data.url}" class="button">Log In Now</a>
          <p>If the button doesn't work, please copy and paste the following link into your browser:</p>
          <p><a href="${data.url}">${data.url}</a></p>
          <p>This link will expire in 15 minutes.</p>
        </div>
        <div class="footer">
          <p>If you didn't request this login link, please ignore this email.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </body>
      </html>
    `,
    text: `Login Link\n\nHello${data.userName ? ` ${data.userName}` : ''},\n\nYou requested a login link for ${data.appName}. Please click the following link to log in:\n\n${data.url}\n\nThis link will expire in 15 minutes.\n\nIf you didn't request this login link, please ignore this email.`
  }),

  zh: (data: EmailTemplateData) => ({
    subject: `您的 ${data.appName} 登录链接`,
    html: `
      <!DOCTYPE html>
      <html lang="zh">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>您的 ${data.appName} 登录链接</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
          .content { padding: 20px 0; }
          .button { display: inline-block; background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${data.appName}</h1>
        </div>
        <div class="content">
          <h2>登录链接</h2>
          <p>您好${data.userName ? ` ${data.userName}` : ''}，</p>
          <p>您请求了 ${data.appName} 的登录链接。请点击下面的按钮登录：</p>
          <a href="${data.url}" class="button">立即登录</a>
          <p>如果按钮无法点击，请复制以下链接到浏览器中打开：</p>
          <p><a href="${data.url}">${data.url}</a></p>
          <p>此链接将在15分钟后过期。</p>
        </div>
        <div class="footer">
          <p>如果您没有请求此登录链接，请忽略此邮件。</p>
          <p>此邮件由系统自动发送，请勿回复。</p>
        </div>
      </body>
      </html>
    `,
    text: `登录链接\n\n您好${data.userName ? ` ${data.userName}` : ''}，\n\n您请求了 ${data.appName} 的登录链接。请点击以下链接登录：\n\n${data.url}\n\n此链接将在15分钟后过期。\n\n如果您没有请求此登录链接，请忽略此邮件。`
  })
};

// OTP Templates
export const otpTemplates: Record<string, (data: OTPTemplateData) => EmailTemplate> = {
  en: (data: OTPTemplateData) => {
    let subject: string;
    let title: string;
    let description: string;
    
    if (data.type === 'sign-in') {
      subject = `Your ${data.appName} sign-in code`;
      title = 'Sign-in Code';
      description = 'You are trying to sign in to your account';
    } else if (data.type === 'email-verification') {
      subject = `Your ${data.appName} email verification code`;
      title = 'Email Verification Code';
      description = 'You are verifying your email address';
    } else {
      subject = `Your ${data.appName} password reset code`;
      title = 'Password Reset Code';
      description = 'You are resetting your password';
    }

    return {
      subject,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
            .content { padding: 20px 0; }
            .otp-code { background-color: #f8f9fa; border: 2px solid #007bff; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 8px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
            .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${data.appName}</h1>
          </div>
          <div class="content">
            <h2>${title}</h2>
            <p>Hello${data.userName ? ` ${data.userName}` : ''},</p>
            <p>${description}. Your verification code is:</p>
            <div class="otp-code">${data.otp}</div>
            <div class="warning">
              <p><strong>Security Notice:</strong></p>
              <p>• This code will expire in 10 minutes</p>
              <p>• Do not share this code with anyone</p>
              <p>• If you didn't request this code, please ignore this email</p>
            </div>
          </div>
          <div class="footer">
            <p>If you didn't request this code, please ignore this email.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </body>
        </html>
      `,
      text: `${title}\n\nHello${data.userName ? ` ${data.userName}` : ''},\n\n${description}. Your verification code is:\n\n${data.otp}\n\nSecurity Notice:\n• This code will expire in 10 minutes\n• Do not share this code with anyone\n• If you didn't request this code, please ignore this email\n\nIf you didn't request this code, please ignore this email.`
    };
  },

  zh: (data: OTPTemplateData) => {
    let subject: string;
    let title: string;
    let description: string;
    
    if (data.type === 'sign-in') {
      subject = `您的 ${data.appName} 登录验证码`;
      title = '登录验证码';
      description = '您正在尝试登录您的账户';
    } else if (data.type === 'email-verification') {
      subject = `您的 ${data.appName} 邮箱验证码`;
      title = '邮箱验证码';
      description = '您正在验证您的邮箱地址';
    } else {
      subject = `您的 ${data.appName} 密码重置验证码`;
      title = '密码重置验证码';
      description = '您正在重置您的密码';
    }

    return {
      subject,
      html: `
        <!DOCTYPE html>
        <html lang="zh">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
            .content { padding: 20px 0; }
            .otp-code { background-color: #f8f9fa; border: 2px solid #007bff; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 8px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
            .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${data.appName}</h1>
          </div>
          <div class="content">
            <h2>${title}</h2>
            <p>您好${data.userName ? ` ${data.userName}` : ''}，</p>
            <p>${description}。您的验证码是：</p>
            <div class="otp-code">${data.otp}</div>
            <div class="warning">
              <p><strong>安全提醒：</strong></p>
              <p>• 此验证码将在10分钟后过期</p>
              <p>• 请勿与他人分享此验证码</p>
              <p>• 如果您没有请求此验证码，请忽略此邮件</p>
            </div>
          </div>
          <div class="footer">
            <p>如果您没有请求此验证码，请忽略此邮件。</p>
            <p>此邮件由系统自动发送，请勿回复。</p>
          </div>
        </body>
        </html>
      `,
      text: `${title}\n\n您好${data.userName ? ` ${data.userName}` : ''}，\n\n${description}。您的验证码是：\n\n${data.otp}\n\n安全提醒：\n• 此验证码将在10分钟后过期\n• 请勿与他人分享此验证码\n• 如果您没有请求此验证码，请忽略此邮件\n\n如果您没有请求此验证码，请忽略此邮件。`
    };
  }
};
