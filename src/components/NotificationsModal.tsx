import React from 'react';
import { Bell, CheckCheck, X, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { NotificationRecord } from '../types/database';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationRecord[];
  onMarkAllAsRead: () => void;
  onSelectIssue?: (issueId: number) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onSelectIssue
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm">Notifications & System Alerts</h3>
            <span className="text-xs px-2 py-0.5 rounded font-mono bg-blue-500/20 text-blue-300">
              {notifications.filter(n => !n.isRead).length} Unread
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-blue-300 hover:text-white flex items-center space-x-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-4 overflow-y-auto divide-y divide-slate-100 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No notifications at this time.
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id}
                className={`pt-3 first:pt-0 cursor-pointer transition-colors ${
                  notif.isRead ? 'opacity-70' : 'bg-blue-50/40 p-2 rounded-lg'
                }`}
                onClick={() => {
                  if (notif.issueId && onSelectIssue) {
                    onSelectIssue(notif.issueId);
                    onClose();
                  }
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 pl-4">
                  {notif.message}
                </p>
                <div className="pl-4 mt-2 flex items-center space-x-2 text-[10px] font-mono text-slate-400">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    Channel: {notif.deliveryChannel}
                  </span>
                  <span>Type: {notif.notificationType}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
