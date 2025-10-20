/**
 * HTTP 代理测试脚本
 * 用于验证代理配置是否正确
 */

import axios from 'axios'
import { HttpsProxyAgent } from 'https-proxy-agent'

async function testProxy() {
  console.log('🧪 测试代理配置\n')
  
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
  
  if (!proxyUrl) {
    console.log('❌ 未配置代理环境变量')
    console.log('\n请设置以下环境变量之一:')
    console.log('  - HTTP_PROXY')
    console.log('  - HTTPS_PROXY')
    console.log('\n示例 (Windows PowerShell):')
    console.log('  $env:HTTP_PROXY="http://127.0.0.1:7890"')
    console.log('  $env:HTTPS_PROXY="http://127.0.0.1:7890"')
    console.log('\n示例 (Linux/Mac):')
    console.log('  export HTTP_PROXY="http://127.0.0.1:7890"')
    console.log('  export HTTPS_PROXY="http://127.0.0.1:7890"')
    process.exit(1)
  }

  console.log('🔄 代理地址:', proxyUrl.replace(/\/\/[^@]*@/, '//***:***@'))
  console.log('🌐 测试目标: https://www.google.com\n')

  try {
    console.log('⏳ 正在连接...')
    
    const response = await axios.get('https://www.google.com', {
      httpsAgent: new HttpsProxyAgent(proxyUrl),
      proxy: false,
      timeout: 10000,
      maxRedirects: 5
    })

    if (response.status === 200) {
      console.log('✅ 代理配置成功！可以访问 Google\n')
      console.log('📊 响应信息:')
      console.log('  - 状态码:', response.status)
      console.log('  - 内容长度:', response.data.length, '字节')
      console.log('  - Content-Type:', response.headers['content-type'])
      console.log('\n🎉 你的代理工作正常，可以用于访问 Google Vertex AI API')
    }
  } catch (error) {
    console.error('❌ 代理测试失败:', error.message)
    console.error('\n可能的原因:')
    console.error('  1. 代理地址或端口错误')
    console.error('  2. 代理服务未启动（请检查 Clash/V2Ray 等是否在运行）')
    console.error('  3. 代理需要认证但未提供用户名密码')
    console.error('  4. 防火墙阻止了连接')
    console.error('\n排查步骤:')
    console.error('  1. 确认代理软件已启动')
    console.error('  2. 检查代理端口号（常见: 7890, 7891, 1080）')
    console.error('  3. 在浏览器中测试代理是否可以访问 Google')
    console.error('  4. 尝试使用不同的代理协议（http:// 或 socks5://）')
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  连接被拒绝：代理端口未监听或地址错误')
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n⚠️  连接超时：代理可能无法访问外网')
    }
    
    process.exit(1)
  }
}

// 测试 Google Vertex AI 域名
async function testVertexAIDomain() {
  console.log('\n🧪 测试 Vertex AI 域名可达性\n')
  
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
  
  if (!proxyUrl) {
    console.log('⚠️  未配置代理，跳过此测试')
    return
  }

  const testUrl = 'https://aiplatform.googleapis.com'
  console.log('🌐 测试目标:', testUrl)

  try {
    const response = await axios.get(testUrl, {
      httpsAgent: new HttpsProxyAgent(proxyUrl),
      proxy: false,
      timeout: 10000,
      validateStatus: () => true // 接受所有状态码
    })

    console.log('✅ Vertex AI 域名可访问')
    console.log('  - 状态码:', response.status, response.statusText)
    console.log('\n🎉 代理可以用于 Vertex AI API 调用！')
  } catch (error) {
    console.error('❌ Vertex AI 域名访问失败:', error.message)
    console.error('\n⚠️  你的代理可能无法访问 Google Cloud API')
  }
}

// 主函数
async function main() {
  try {
    await testProxy()
    await testVertexAIDomain()
  } catch (error) {
    console.error('测试过程出错:', error)
    process.exit(1)
  }
}

main()

