// src/app/api/hunyuan/route.ts

import { NextResponse } from 'next/server';
import * as tencentcloud from 'tencentcloud-sdk-nodejs';

const HunyuanClient = tencentcloud.hunyuan.v20230901.Client;

// 1. 从环境变量中获取密钥
const clientConfig = {
  credential: {
    secretId: process.env.TENCENT_SECRET_ID,
    secretKey: process.env.TENCENT_SECRET_KEY,
  },
  region: 'ap-guangzhou', // 区域，请根据您的服务区域修改
  profile: {
    httpProfile: {
      endpoint: 'hunyuan.tencentcloudapi.com',
    },
  },
};

const client = new HunyuanClient(clientConfig);

// 定义API处理函数
export async function POST(request: Request) {
  // 2. 从前端请求中获取用户消息
  const { message } = await request.json();

  if (!message) {
    return NextResponse.json({ error: '缺少消息内容' }, { status: 400 });
  }

  if (!process.env.TENCENT_SECRET_ID || !process.env.TENCENT_SECRET_KEY) {
    return NextResponse.json({ error: '缺少腾讯云密钥配置' }, { status: 500 });
  }

  const params = {
    // 3. 构建发送给混元大模型的参数
    Model: 'hunyuan-standard',
    Messages: [{ Role: 'user', Content: message }],
    // 您可以根据需要调整其他参数，如 Temperature, TopP 等
  };

  try {
    // 4. 调用SDK，发送请求
    const response = await client.ChatCompletions(params);

    // 5. 将模型的回复返回给前端
    return NextResponse.json(response);
  } catch (error) {
    console.error('Hunyuan API Error:', error);
    return NextResponse.json({ error: '调用混元大模型失败', details: error }, { status: 500 });
  }
}