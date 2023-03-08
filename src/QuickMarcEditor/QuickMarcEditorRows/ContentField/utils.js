export const getResizeStyles = (el) => {
  if (el) {
    const {
      borderBottomWidth,
      borderTopWidth,
    } = window.getComputedStyle(el);

    const scrollHeight =
      el.scrollHeight + parseFloat(borderBottomWidth) + parseFloat(borderTopWidth);

    return {
      resize: 'none',
      overflowY: 'hidden',
      height: `${scrollHeight}px`,
    };
  }

  return {};
};
