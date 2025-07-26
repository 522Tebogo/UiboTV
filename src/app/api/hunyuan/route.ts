// src/app/api/hunyuan/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'edge';

const secretId = process.env.TENCENT_SECRET_ID;
const secretKey = process.env.TENCENT_SECRET_KEY;
const region = 'ap-guangzhou';
const service = 'hunyuan';
const host = 'hunyuan.tencentcloudapi.com';
const version = '2023-09-01';
const action = 'ChatCompletions';

async function getSignatureKey(secretKey: string, date: string, service: string) {
  const enc = new TextEncoder();
  const hmacSha256 = async (key: CryptoKey, data: string) => await crypto.subtle.sign('HMAC', key, enc.encode(data));

  const kSecret = enc.encode('TC3' + secretKey);
  const secretDateKey = await crypto.subtle.importKey('raw', kSecret, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const kDate = await hmacSha256(secretDateKey, date);

  const secretServiceKey = await crypto.subtle.importKey('raw', kDate, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const kService = await hmacSha256(secretServiceKey, service);

  const secretSigningKey = await crypto.subtle.importKey('raw', kService, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const kSigning = await hmacSha256(secretSigningKey, 'tc3_request');

  return crypto.subtle.importKey('raw', kSigning, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: '缺少消息内容' }, { status: 400 });
    }
    if (!secretId || !secretKey) {
      return NextResponse.json({ error: '缺少腾讯云密钥配置，请检查环境变量' }, { status: 500 });
    }

    const body = { Model: 'hunyuan-turbos-latest', Messages: [{ Role: 'user', Content: message }] };
    const payload = JSON.stringify(body);

    // --- 开始签名过程 ---
    console.log("--- [DEBUG] 开始签名 ---");

    const now = new Date();
    const timestamp = Math.floor(now.getTime() / 1000).toString();
    const date = `${now.getUTCFullYear()}-${(now.getUTCMonth() + 1).toString().padStart(2, '0')}-${now.getUTCDate().toString().padStart(2, '0')}`;
    console.log(`[DEBUG] Timestamp: ${timestamp}, Date: ${date}`);

    // 步骤 1: 规范请求
    const httpRequestMethod = 'POST';
    const canonicalURI = '/';
    const canonicalQueryString = '';
    const canonicalHeaders = `content-type:application/json; charset=utf-8\nhost:${host}\n`;
    const signedHeaders = 'content-type;host';
    const hashedRequestPayload = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload)).then(hash => Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''));

    const canonicalRequest = `${httpRequestMethod}\n${canonicalURI}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${hashedRequestPayload}`;
    console.log(`[DEBUG] CanonicalRequest:\n${canonicalRequest}\n---`);

    // 步骤 2: 待签字符串
    const algorithm = 'TC3-HMAC-SHA256';
    const hashedCanonicalRequest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest)).then(hash => Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''));
    const credentialScope = `${date}/${service}/tc3_request`;
    const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`;
    console.log(`[DEBUG] StringToSign:\n${stringToSign}\n---`);

    // 步骤 3: 计算签名
    const signatureKey = await getSignatureKey(secretKey, date, service);
    const signature = await crypto.subtle.sign('HMAC', signatureKey, new TextEncoder().encode(stringToSign)).then(sig => Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join(''));
    console.log(`[DEBUG] Final Signature: ${signature}`);

    // 步骤 4: 拼接头部
    const authorization = `${algorithm} Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
    console.log(`[DEBUG] Authorization Header: ${authorization}`);
    console.log("--- [DEBUG] 签名结束, 发送请求 ---");


    const response = await fetch(`https://${host}`, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json; charset=utf-8',
        'Host': host,
        'X-TC-Action': action,
        'X-TC-Version': version,
        'X-TC-Timestamp': timestamp,
        'X-TC-Region': region,
      },
      body: payload,
    });

    const data = await response.json();

    if (data.Response?.Error) {
      console.error('Hunyuan API Error:', data.Response.Error);
      return NextResponse.json({ error: '调用混元大模型失败', details: data.Response.Error }, { status: 500 });
    }

    return NextResponse.json(data.Response);

  } catch (error: any) {
    console.error('Request Failed Unexpectedly:', error);
    return NextResponse.json({ error: '请求意外失败', details: error.message || error }, { status: 500 });
  }
}