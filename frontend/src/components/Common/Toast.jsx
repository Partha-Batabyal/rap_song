import { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: {
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
      shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
      icon: CheckCircle
    },
    error: {
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'border-red-500/30',
      iconColor: 'text-red-400',
      shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.15)]',
      icon: AlertCircle
    },
    info: {
      bg: 'rgba(6, 182, 212, 0.1)',
      border: 'border-cyan-500/30',
      iconColor: 'text-cyan-400',
      shadow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]',
      icon: Info
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'border-amber-500/30',
      iconColor: 'text-amber-400',
      shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
      icon: AlertTriangle
    }
  };

  const currentStyle = styles[type] || styles.success;
  const Icon = currentStyle.icon;

  return (
    <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-md border ${currentStyle.bg} ${currentStyle.border} ${currentStyle.shadow} animate-float select-none max-w-sm`}>
      <Icon className={`w-5 h-5 flex-shrink-0 ${currentStyle.iconColor}`} />
      <span className="text-sm font-medium text-zinc-100">{message}</span>
      <button 
        onClick={onClose}
        className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded-lg transition-colors ml-2"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
