// API 请求相关的类型定义和函数

export interface FlowData {
  cellStyleMap: Record<string, unknown>;
  sumFlow: number;       // 总流量 (MB)
  consumeFlow: number;   // 已用流量 (MB)
  surplusFlow: number;   // 剩余流量 (MB)
  isChange: number;
  maxEndTime: string;    // 到期时间
  endRemind: boolean;
}

export interface ApiResponse {
  code: number;
  status: boolean;
  msg: string;
  data: FlowData;
}

/**
 * 获取SIM卡流量信息
 * @param card SIM卡号
 * @returns 流量数据
 */
export async function getCardFlow(card: string): Promise<ApiResponse> {
  try {

    // 先发送请求让服务器更新流量数据（忽略返回结果）
    try {
      await fetch(`https://xj.iot998.cn/app/simCard/getCardFlow?card=${card}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch {
      // 忽略更新请求的错误
    }
    
    const response = await fetch(`https://xj.iot998.cn/app/simCard/phoneSimCard?card=${card}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error('获取流量信息失败:', error);
    throw error;
  }
}

/**
 * 将MB转换为GB
 * @param mb MB值
 * @returns GB值（保留2位小数）
 */
export function mbToGb(mb: number): number {
  return Number((mb / 1024).toFixed(2));
}

/**
 * 计算流量使用百分比
 * @param consumeFlow 已用流量
 * @param sumFlow 总流量
 * @returns 使用百分比（0-100）
 */
export function calculateUsagePercentage(consumeFlow: number, sumFlow: number): number {
  if (sumFlow === 0) return 0;
  return Math.round((consumeFlow / sumFlow) * 100);
}
