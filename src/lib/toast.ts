import { toast } from 'sonner';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
    });
  },
  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
    });
  },
  info: (message: string) => {
    toast.info(message, {
      duration: 3000,
    });
  },
  warning: (message: string) => {
    toast.warning(message, {
      duration: 3000,
    });
  },
};

export default showToast;

