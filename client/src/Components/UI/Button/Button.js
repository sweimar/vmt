import React from 'react';
import PropTypes from 'prop-types';
import classes from './button.css';

const Button = props => {
  const { theme, disabled, m, click, type, children, tabIndex } = props;
  // let styles = [classes.Button]
  let styles = classes[theme];
  if (disabled) {
    styles = classes.Disabled;
  }
  return (
    // eslint-disable-next-line react/button-has-type
    <button
      className={styles}
      style={{ margin: m }}
      onClick={click}
      type={type}
      tabIndex={tabIndex}
      // eslint-disable-next-line react/destructuring-assignment
      data-testid={props['data-testid']}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  'data-testid': PropTypes.string,
  theme: PropTypes.string,
  disabled: PropTypes.bool,
  m: PropTypes.number,
  click: PropTypes.func.isRequired,
  tabIndex: PropTypes.number,
  type: PropTypes.string,
  children: PropTypes.node.isRequired,
};

Button.defaultProps = {
  tabIndex: 0,
  m: 0,
  disabled: false,
  type: 'button',
  'data-testid': null,
  theme: 'Small',
};

export default Button;
