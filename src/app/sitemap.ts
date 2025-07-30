// 文件路径: src/app/sitemap.ts

import { MetadataRoute } from 'next'

// 这个函数定义了你网站的地图
export default function sitemap(): MetadataRoute.Sitemap {
  // 返回一个包含你网站所有页面URL的数组
  return [
    {
      // 网站主页
      url: 'https://uibo666.shop', //  必须替换成您自己的域名
      lastModified: new Date(), // 最近修改日期
      changeFrequency: 'yearly', // 建议的更新频率
      priority: 1, // 页面优先级 (1.0 最高)
    }
  ]
}