'use client';

import React from 'react';

interface LiquidProgressProps {
  percentage: number; // 剩余流量百分比 (0-100)
  size?: number; // 圆的大小，默认200px
  color?: string; // 液体颜色
  backgroundColor?: string; // 背景颜色
}

export const LiquidProgress: React.FC<LiquidProgressProps> = ({
  percentage,
  size = 200,
  color = '#3b82f6',
  backgroundColor = '#f1f5f9'
}) => {
  // 确保百分比在0-100之间
  const normalizedPercentage = Math.max(0, Math.min(100, percentage));
  
  return (
    <div 
      className="relative overflow-hidden rounded-full flex items-center justify-center"
      style={{ 
        width: size, 
        height: size,
        backgroundColor 
      }}
    >
      {/* 液体效果 */}
      <div
        className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out"
        style={{
          height: `${normalizedPercentage}%`,
          backgroundColor: color,
          borderRadius: normalizedPercentage > 90 ? '50%' : '0 0 50% 50%'
        }}
      >
        {/* 波浪动画效果 */}
        <div
          className="absolute top-0 left-0 w-full h-4 opacity-70"
          style={{
            background: `linear-gradient(90deg, ${color} 0%, rgba(255,255,255,0.3) 50%, ${color} 100%)`,
            animation: 'wave 2s ease-in-out infinite',
            transform: 'translateY(-50%)'
          }}
        />
      </div>
      
      {/* 百分比文字 */}
      <div className="relative z-10 text-center">
        <div 
          className="font-bold text-2xl"
          style={{ 
            color: normalizedPercentage > 50 ? 'white' : '#374151',
            textShadow: normalizedPercentage > 50 ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
          }}
        >
          {normalizedPercentage.toFixed(0)}%
        </div>
        <div 
          className="text-sm opacity-80"
          style={{ 
            color: normalizedPercentage > 50 ? 'white' : '#6b7280'
          }}
        >
          剩余
        </div>
      </div>

      {/* CSS动画样式 */}
      <style jsx>{`
        @keyframes wave {
          0%, 100% {
            transform: translateY(-50%) scaleX(1);
          }
          50% {
            transform: translateY(-50%) scaleX(1.1);
          }
        }
      `}</style>
    </div>
  );
};
