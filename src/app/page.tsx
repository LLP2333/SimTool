'use client';

import React, { useState, useEffect } from 'react';
import { getCardFlow, mbToGb, calculateUsagePercentage, type FlowData } from '@/lib/api';
import { LiquidProgress } from '@/components/LiquidProgress';

export default function Home() {
  const [cardNumber, setCardNumber] = useState('');
  const [flowData, setFlowData] = useState<FlowData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 从 localStorage 获取卡号
  useEffect(() => {
    const savedCard = localStorage.getItem('simCardNumber');
    if (savedCard) {
      setCardNumber(savedCard);
    }
  }, []);

  // 保存卡号到 localStorage
  const saveCardNumber = (card: string) => {
    localStorage.setItem('simCardNumber', card);
  };

  // 获取流量数据
  const fetchFlowData = async () => {
    if (!cardNumber.trim()) {
      setError('请输入卡号');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getCardFlow(cardNumber.trim());
      
      if (response.status && response.code === 0) {
        setFlowData(response.data);
        saveCardNumber(cardNumber.trim());
      } else {
        setError(response.msg || '获取流量信息失败');
      }
    } catch (err) {
      setError('网络请求失败，请检查网络连接');
      console.error('获取流量数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 处理卡号输入
  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(e.target.value);
  };

  // 处理回车键
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchFlowData();
    }
  };

  // 计算剩余流量百分比
  const getRemainingPercentage = () => {
    if (!flowData) return 0;
    return (flowData.surplusFlow / flowData.sumFlow) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            SIM卡流量查询
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            查看您的流量使用情况和到期时间
          </p>
        </div>

        {/* 卡号输入区域 */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SIM卡号
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardInputChange}
                onKeyPress={handleKeyPress}
                placeholder="请输入SIM卡号"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
              <button
                onClick={fetchFlowData}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '查询中...' : '查询'}
              </button>
            </div>
          </div>
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* 流量信息展示 */}
        {flowData && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* 液体进度圆 */}
                <div className="flex justify-center">
                  <LiquidProgress 
                    percentage={getRemainingPercentage()}
                    size={250}
                    color="#3b82f6"
                    backgroundColor="#f1f5f9"
                  />
                </div>

                {/* 详细信息 */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    流量使用详情
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-300">总流量</span>
                      <span className="font-semibold text-lg text-gray-800 dark:text-white">
                        {mbToGb(flowData.sumFlow)} GB
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-300">已用流量</span>
                      <span className="font-semibold text-lg text-orange-600 dark:text-orange-400">
                        {mbToGb(flowData.consumeFlow)} GB
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-300">剩余流量</span>
                      <span className="font-semibold text-lg text-green-600 dark:text-green-400">
                        {mbToGb(flowData.surplusFlow)} GB
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-300">使用率</span>
                      <span className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                        {calculateUsagePercentage(flowData.consumeFlow, flowData.sumFlow)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-300">到期时间</span>
                      <span className="font-semibold text-lg text-purple-600 dark:text-purple-400">
                        {flowData.maxEndTime}
                      </span>
                    </div>
                  </div>

                  {/* 刷新按钮 */}
                  <button
                    onClick={fetchFlowData}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                  >
                    {loading ? '刷新中...' : '刷新数据'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 底部说明 */}
        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>power by  qvqw.date</p>
        </div>
      </div>
    </div>
  );
}
