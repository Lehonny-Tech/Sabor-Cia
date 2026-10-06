import React, { useState, useEffect } from 'react';
import { Bell, X, Sparkles, ChevronRight, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PushNotification } from '../types';

export const NotificationToast: React.FC = () => {
  const { notifications, setActiveTrackingOrderId, markNotificationAsRead } = useApp();
  const [activeToast, setActiveToast] = useState<PushNotification | null>(null);

  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      // If it arrived recently and hasn't been closed
      setActiveToast(latest);
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  if (!activeToast) return null;

  return (
    <div
      id="push-notification-toast"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-stone-900 text-white p-4 rounded-2xl shadow-2xl border border-stone-700 animate-in slide-in-from-bottom-5 duration-300 flex items-start gap-3"
    >
      <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-md">
        <Bell className="w-5 h-5 animate-bounce" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-amber-300 truncate">{activeToast.title}</h4>
          <span className="text-[10px] text-stone-400">{activeToast.timestamp}</span>
        </div>
        <p className="text-xs text-stone-300 mt-0.5 leading-snug">{activeToast.message}</p>

        {activeToast.orderId && (
          <button
            id="toast-track-order-btn"
            onClick={() => {
              markNotificationAsRead(activeToast.id);
              setActiveTrackingOrderId(activeToast.orderId!);
              setActiveToast(null);
            }}
            className="mt-2 text-[11px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 hover:underline"
          >
            <span>Ver acompanhamento ao vivo</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      <button
        id="close-toast-btn"
        onClick={() => setActiveToast(null)}
        className="text-stone-400 hover:text-white p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
