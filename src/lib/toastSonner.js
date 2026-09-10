"use client";

import { toast } from "sonner";

const formatMessage = (msg) => {
  return msg?.toLowerCase()?.replace(/_/g, " ")?.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const showToast = {
  success: (title, description) =>
    toast.success(formatMessage(title), { description }),

  error: (title, description) =>
    toast.error(formatMessage(title), { description }),

  info: (title, description) =>
    toast(formatMessage(title), { description }),

  promise: (promise, messages) =>
    toast.promise(promise, {
      loading: formatMessage(messages.loading),
      success: formatMessage(messages.success),
      error: formatMessage(messages.error),
    }),
};