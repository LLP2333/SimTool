'use client';

import React, { useState, useEffect } from 'react';
import { getCardFlow, mbToGb, calculateUsagePercentage, type FlowData } from '@/lib/api';
import { LiquidProgress } from '@/components/LiquidProgress';

export default function Home() {
  const [cardNumber, setCardNumber] = useState('');
  const [flowData, setFlowData] = useState<FlowData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInputForm, setShowInputForm] = useState(true);

  // 从 localStorage 获取卡号并自动查询
  useEffect(() => {
    const savedCard = localStorage.getItem('simCardNumber');
    if (savedCard) {
      setCardNumber(savedCard);
      // 自动查询流量数据
      fetchFlowDataWithCard(savedCard);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 保存卡号到 localStorage
  const saveCardNumber = (card: string) => {
    localStorage.setItem('simCardNumber', card);
  };

  // 获取流量数据的通用函数
  const fetchFlowDataWithCard = async (card: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getCardFlow(card);
      
      if (response.status && response.code === 0) {
        setFlowData(response.data);
        saveCardNumber(card);
        setShowInputForm(false); // 成功获取数据后隐藏输入界面
      } else {
        setError(response.msg || '获取流量信息失败');
        setShowInputForm(true); // 失败时显示输入界面
      }
    } catch (err) {
      setError('网络请求失败，请检查网络连接');
      console.error('获取流量数据失败:', err);
      setShowInputForm(true); // 失败时显示输入界面
    } finally {
      setLoading(false);
    }
  };

  // 获取流量数据
  const fetchFlowData = async () => {
    if (!cardNumber.trim()) {
      setError('请输入卡号');
      return;
    }

    await fetchFlowDataWithCard(cardNumber.trim());
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

  // 返回输入卡号界面
  const handleBackToInput = () => {
    setShowInputForm(true);
    setFlowData(null);
    setError(null);
  };

  // 刷新当前卡号的流量数据
  const handleRefreshData = () => {
    if (cardNumber) {
      fetchFlowDataWithCard(cardNumber);
    }
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

        {/* 卡号输入区域 - 只在需要时显示 */}
        {showInputForm && (
          <>
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
          </>
        )}

        {/* 流量信息展示 */}
        {flowData && !showInputForm && (
          <div className="max-w-4xl mx-auto">
            {/* 卡号信息和返回按钮 */}
            <div className="mb-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                  <span className="text-blue-800 dark:text-blue-300 text-sm font-medium">
                    卡号: {cardNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={handleBackToInput}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                更换卡号
              </button>
            </div>

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
                    onClick={handleRefreshData}
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

        {/* 加载状态 - 在数据加载但没有流量数据且不显示输入表单时显示 */}
        {loading && !flowData && !showInputForm && (
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">正在加载流量数据...</p>
            </div>
          </div>
        )}

        {/* 错误信息 - 在不显示输入表单时的错误显示 */}
        {error && !showInputForm && (
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
              <button
                onClick={handleBackToInput}
                className="mt-3 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 underline"
              >
                返回重新输入卡号
              </button>
            </div>
          </div>
        )}

        {/* 底部说明 */}
        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>power by qvqw.date</p>
        </div>
      </div>
    </div>
  );
}
