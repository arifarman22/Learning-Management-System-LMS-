'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface Notification {
  id: string;
  type: 'lesson' | 'assignment' | 'announcement' | 'completion';
  title: string;
  message: string;
  courseTitle?: string;
  createdAt: string;
  read: boolean;
}

export const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'lesson',
      title: 'New Lesson Available',
      message: 'Chapter 3: Advanced React Hooks is now available',
      courseTitle: 'React Masterclass',
      createdAt: new Date().toISOString(),
      read: false,
    },
    {
      id: '2',
      type: 'assignment',
      title: 'Assignment Due Soon',
      message: 'Your final project is due in 2 days',
      courseTitle: 'Node.js Complete Guide',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      read: false,
    },
    {
      id: '3',
      type: 'completion',
      title: 'Course Completed!',
      message: 'Congratulations! You have completed TypeScript Pro',
      courseTitle: 'TypeScript Pro',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      read: true,
    },
  ]);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'lesson': return '📚';
      case 'assignment': return '📝';
      case 'announcement': return '📢';
      case 'completion': return '🎉';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'lesson': return 'bg-blue-50 border-blue-200';
      case 'assignment': return 'bg-orange-50 border-orange-200';
      case 'announcement': return 'bg-purple-50 border-purple-200';
      case 'completion': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-20 max-h-96 overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Mark all read
                </button>
              )}
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        {notification.courseTitle && (
                          <p className="text-xs text-gray-500 mt-1">
                            Course: {notification.courseTitle}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <span className="text-4xl mb-2 block">🔔</span>
                  <p>No notifications yet</p>
                </div>
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="p-3 border-t bg-gray-50">
                <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View All Notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};