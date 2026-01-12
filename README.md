# cf-pages-auth-shield

A lightweight password authentication shield for Cloudflare Pages, powered by Cloudflare Workers.

这是一个基于 **Cloudflare Workers** 的轻量级访问控制方案，用于给 **Cloudflare Pages** 站点添加「密码登录保护」，适合个人导航站、内部工具页、临时项目展示页等场景。

---

## ✨ 功能特性

- 🔐 **单密码访问控制**（无需账号系统）
- 🍪 **Cookie 登录态**（默认 90 天免登录）
- ⚡ **零依赖、纯 Worker 实现**
- 🌍 **全球边缘节点生效**
- 🧩 **无需改动 Pages 源码**
- 🔄 **支持环境变量配置密码**
- 🛡️ **HttpOnly + Secure Cookie**

---

## 📌 适用场景

- Cloudflare Pages 无法原生设置访问密码
- 私人导航站 / 私有收藏站
- 临时分享但不想公开的页面
- 轻量级访问拦截（不追求复杂权限体系）

> 本项目**不是**账号系统，也**不是**企业级身份认证  
> 它的目标是：**简单、够用、稳定**

---

## 🏗️ 工作原理
```
访客请求
↓
Cloudflare Worker（本项目）
├─ 已有有效 Cookie → 直接放行
├─ 提交密码正确 → 设置 Cookie → 重定向
└─ 未登录 / 密码错误 → 返回登录页面
↓
Cloudflare Pages 站点

Worker 作为 Pages 的**访问入口**，实现真正意义上的“前置拦截”。

```

## 🚀 部署方式

### 1️⃣ 创建 Cloudflare Worker

- Cloudflare Dashboard → Workers & Pages → Workers
- 新建 Worker
- 将本仓库的 `index.js` 内容完整粘贴

---

### 2️⃣（强烈推荐）设置环境变量密码

进入 Worker 设置：

Settings → Variables → Add variable

| 名称 | 值 |
|----|----|
| AUTH_PASSWORD | 你的访问密码 |

> 设置后会 **自动覆盖代码里的默认密码**

---

### 3️⃣ 绑定到 Pages 域名

将该 Worker 绑定到你的 Pages 域名或自定义域名，使其成为访问入口。

---

## ⚙️ 配置说明

```js
const CONFIG = {
  DEFAULT_PASSWORD: "admin",   // 仅用于测试,会被环境变量AUTH_PASSWORD覆盖，只需设置这一个环境变量
  COOKIE_NAME: "nav_auth_session",
  COOKIE_VAL: "valid_token_90days",
  MAX_AGE: 7776000, // 90 天
};

```
## 配置项	说明
DEFAULT_PASSWORD	兜底密码（不建议生产使用）
COOKIE_NAME	登录标记 Cookie 名
COOKIE_VAL	Cookie 校验值
MAX_AGE	登录有效期（秒）
