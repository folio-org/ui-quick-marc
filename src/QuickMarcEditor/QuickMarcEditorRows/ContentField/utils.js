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

const indexOfRegex = (string, regex) => {
  const match = string.match(regex);

  return match ? string.indexOf(match[0]) : -1;
};

const lastIndexOfRegex = (string, regex) => {
  const match = string.match(regex);

  return match ? string.lastIndexOf(match[match.length - 1]) : -1;
};

export const cursorToNextSubfield = (e) => {
  e.preventDefault();
  const cursorPosition = e.target.selectionStart;
  const valueAfterCursor = e.target.value.substring(cursorPosition);

  const nextSubfieldIndex = indexOfRegex(valueAfterCursor, /\$\w\s/g);

  if (nextSubfieldIndex === -1) {
    return;
  }

  const newPosition = nextSubfieldIndex + cursorPosition + 3;

  e.target.setSelectionRange(newPosition, newPosition);
};

export const cursorToPrevSubfield = (e) => {
  e.preventDefault();
  const cursorPosition = e.target.selectionStart;
  const startOfCurrentSubfieldPosition = lastIndexOfRegex(e.target.value.substring(0, cursorPosition), /\$\w\s/g);
  const valueBeforeCurrentSubfield = e.target.value.substring(0, startOfCurrentSubfieldPosition);

  const prevSubfieldIndex = lastIndexOfRegex(valueBeforeCurrentSubfield, /\$\w\s/g);

  if (prevSubfieldIndex === -1) {
    return;
  }

  const newPosition = prevSubfieldIndex + 3;

  e.target.setSelectionRange(newPosition, newPosition);
};
