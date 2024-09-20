jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  ConfirmationModal: jest.fn(({ heading, message, onConfirm, onCancel, onRemove }) => (
    <div>
      <span>ConfirmationModal</span>
      {heading}
      <div>{message}</div>
      <div>
        <button type="button" onClick={onConfirm}>confirm</button>
        <button type="button" onClick={onCancel}>cancel</button>
        <button type="button" onClick={onRemove}>remove</button>
      </div>
    </div>
  )),
  Loading: () => <div>Loading</div>,
  LoadingPane: () => <div>LoadingPane</div>,
  LoadingView: jest.fn(() => <div>LoadingView</div>),
  Modal: jest.fn(({ children, open, label, footer, ...rest }) => {
    return open && (
      <div
        {...rest}
      >
        <h1>{label}</h1>
        {children}
        {footer}
      </div>
    );
  }),
}), { virtual: true });
