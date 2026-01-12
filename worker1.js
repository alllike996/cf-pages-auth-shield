/**
 * 配置区域，此项目主要给cf的pages加入一个密码登录页面
 */
const CONFIG = {
  // 这里是为了方便测试，实际建议在后台 设置 -> 变量 中配置 AUTH_PASSWORD
  // 如果后台配置了环境变量，这里的默认值会被覆盖
  DEFAULT_PASSWORD: "admin", 
  COOKIE_NAME: "wall_auth_session",
  COOKIE_VAL: "valid_token_90days", // 简单的验证标记
  // 90天 = 90 * 24 * 60 * 60 秒
  MAX_AGE: 7776000, 
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 1. 获取正确的密码 (优先使用环境变量 AUTH_PASSWORD，如果没有则使用代码里的默认值)
    const PASSWORD = env.AUTH_PASSWORD || CONFIG.DEFAULT_PASSWORD;

    // 2. 检查 Cookie 是否存在且有效
    const cookieHeader = request.headers.get("Cookie");
    if (cookieHeader && cookieHeader.includes(`${CONFIG.COOKIE_NAME}=${CONFIG.COOKIE_VAL}`)) {
      // 验证通过，直接放行请求到你的导航站
      return fetch(request);
    }

    // 3. 如果是 POST 请求，说明用户正在提交密码
    if (request.method === "POST") {
      const formData = await request.formData();
      const inputPassword = formData.get("password");

      if (inputPassword === PASSWORD) {
        // 密码正确，设置 Cookie 并重定向回首页
        // Calculate expiration date not strictly needed with Max-Age, but good for compatibility
        return new Response("登录成功，正在跳转...", {
          status: 302,
          headers: {
            "Location": "/",
            // 关键：设置 Max-Age 为 90天，HttpOnly 防止 JS 读取，SameSite=Lax 兼顾体验与安全
            "Set-Cookie": `${CONFIG.COOKIE_NAME}=${CONFIG.COOKIE_VAL}; Max-Age=${CONFIG.MAX_AGE}; Path=/; HttpOnly; Secure; SameSite=Lax`
          }
        });
      } else {
        // 密码错误，重新加载页面并提示
        return getLoginPage("密码错误，请重试");
      }
    }

    // 4. 其他情况（未登录且不是 POST），返回登录页面
    return getLoginPage();
  }
};

/**
 * 生成登录页面的 HTML 函数
 * @param {string} errorMsg 错误提示信息
 */
function getLoginPage(errorMsg = "") {
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>访问受限 - 请输入密码</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f3f4f6; }
    .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); width: 100%; max-width: 320px; text-align: center; }
    h2 { margin-top: 0; color: #1f2937; }
    input { width: 100%; padding: 0.75rem; margin: 1rem 0; border: 1px solid #d1d5db; border-radius: 6px; box-sizing: border-box; font-size: 16px; }
    button { width: 100%; background-color: #2563eb; color: white; padding: 0.75rem; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; transition: background 0.2s; }
    button:hover { background-color: #1d4ed8; }
    .error { color: #dc2626; font-size: 0.875rem; margin-bottom: 0.5rem; }
  </style>
</head>
<body>
  <div class="card">
    <h2>🔒 站点已加密</h2>
    ${errorMsg ? `<p class="error">${errorMsg}</p>` : ''}
    <form method="POST">
      <input type="password" name="password" placeholder="请输入访问密码" required autofocus>
      <button type="submit">进入导航站</button>
    </form>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html;charset=UTF-8" }
  });
} 
