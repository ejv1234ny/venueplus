/* @ds-bundle: {"format":3,"namespace":"VenuePlusDesignSystem_17f1a7","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Checkbox","sourcePath":"components/core/Checkbox.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"Select","sourcePath":"components/core/Select.jsx"},{"name":"Tabs","sourcePath":"components/core/Tabs.jsx"},{"name":"KpiCard","sourcePath":"components/operator/KpiCard.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"acbc242c7a11","components/core/Badge.jsx":"9775a375a93d","components/core/Button.jsx":"3a25b34ac4d1","components/core/Card.jsx":"56064e1a902e","components/core/Checkbox.jsx":"2bd0fc7b31f3","components/core/Input.jsx":"cd0efc47a0e2","components/core/Select.jsx":"9bcb9a45684a","components/core/Tabs.jsx":"7abee2e30416","components/operator/KpiCard.jsx":"e22799c1cc08","guidelines/agent-manual/data.js":"1eae86b56e6b","guidelines/agent-manual/manual.jsx":"d87177fd5e27","guidelines/fleet-map/flow.jsx":"813c5b5d54a0","ui_kits/disputes/app.jsx":"c86247eecde6","ui_kits/disputes/data.js":"43b43328e780","ui_kits/finance/app.jsx":"04a514de3d53","ui_kits/finance/data.js":"1628ecc7c1b0","ui_kits/marketplace/Detail.jsx":"8cb4feed5df7","ui_kits/marketplace/Market.jsx":"611232c8d351","ui_kits/marketplace/Site.jsx":"f5f0e4b84448","ui_kits/marketplace/data.js":"861552c8265b","ui_kits/marketplace/screens.jsx":"7cce43a1d6a6","ui_kits/mission-control/Agents.jsx":"54eb9ca50ef9","ui_kits/mission-control/Console.jsx":"c526c3152fd1","ui_kits/mission-control/Escalations.jsx":"2e1562449dc7","ui_kits/mission-control/Overview.jsx":"a50d92aa8b4e","ui_kits/mission-control/Runs.jsx":"af54123e7ab8","ui_kits/mission-control/Settings.jsx":"f4c1cf2a2586","ui_kits/mission-control/Shell.jsx":"31ee2092d93a","ui_kits/mission-control/data.js":"96af35665e26","ui_kits/mobile-operator/app.jsx":"79ed72fcd46f","ui_kits/mobile-operator/ios-frame.jsx":"be3343be4b51","ui_kits/notifications/app.jsx":"f85a93ce4f4e","ui_kits/onboarding/app.jsx":"057a47a9f6be","ui_kits/onboarding/listerSteps.jsx":"d4f013a7b033","ui_kits/onboarding/providerSteps.jsx":"2592d6fa27ae","ui_kits/onboarding/shared.jsx":"ddb5e5424f53","ui_kits/operator-launch/app.jsx":"8a809f0b2c99"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.VenuePlusDesignSystem_17f1a7 = window.VenuePlusDesignSystem_17f1a7 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * VenuePlus avatar. Shows an image, or initials on the brand gradient (the
 * app's signature teal→coral circle used in the navbar user menu).
 */
function Avatar({
  src,
  name = '',
  size = 'md',
  style = {},
  ...rest
}) {
  const sizes = {
    xs: 28,
    sm: 36,
    md: 44,
    lg: 56,
    xl: 80
  };
  const px = sizes[size] || sizes.md;
  const initials = name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      width: px,
      height: px,
      borderRadius: 'var(--radius-full)',
      flexShrink: 0,
      overflow: 'hidden',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: src ? 'var(--neutral-200)' : 'var(--gradient-brand)',
      color: 'var(--white)',
      fontFamily: 'var(--font-sans)',
      fontWeight: 'var(--weight-semibold)',
      fontSize: px * 0.4,
      ...style
    }
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : initials || '?');
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * VenuePlus pill badge. Used for booking statuses and service categories.
 * Pass a semantic `tone` OR a `category` to auto-pick the brand chip colors.
 */
const TONES = {
  neutral: {
    bg: 'var(--neutral-100)',
    fg: 'var(--neutral-700)'
  },
  brand: {
    bg: 'var(--primary-100)',
    fg: 'var(--primary-700)'
  },
  pending: {
    bg: 'var(--status-pending-bg)',
    fg: 'var(--status-pending-fg)'
  },
  success: {
    bg: 'var(--status-success-bg)',
    fg: 'var(--status-success-fg)'
  },
  error: {
    bg: 'var(--status-error-bg)',
    fg: 'var(--status-error-fg)'
  },
  info: {
    bg: 'var(--status-info-bg)',
    fg: 'var(--status-info-fg)'
  }
};
const STATUS_TONE = {
  pending: 'pending',
  awaiting_payment: 'pending',
  confirmed: 'success',
  accepted: 'success',
  completed: 'info',
  cancelled: 'error',
  declined: 'error',
  // agent run / job lifecycle
  done: 'success',
  running: 'info',
  planned: 'neutral',
  needs_approval: 'pending',
  blocked: 'error',
  failed: 'error'
};
const RISK = {
  read: {
    bg: 'var(--risk-read-bg)',
    fg: 'var(--risk-read-fg)'
  },
  internal_write: {
    bg: 'var(--risk-internal-bg)',
    fg: 'var(--risk-internal-fg)'
  },
  outbound: {
    bg: 'var(--risk-outbound-bg)',
    fg: 'var(--risk-outbound-fg)'
  },
  financial: {
    bg: 'var(--risk-financial-bg)',
    fg: 'var(--risk-financial-fg)'
  },
  money_movement: {
    bg: 'var(--risk-money-bg)',
    fg: 'var(--risk-money-fg)'
  },
  legal: {
    bg: 'var(--risk-legal-bg)',
    fg: 'var(--risk-legal-fg)'
  }
};
const DECISION = {
  auto: {
    bg: 'var(--decision-auto-bg)',
    fg: 'var(--decision-auto-fg)'
  },
  require_approval: {
    bg: 'var(--decision-approval-bg)',
    fg: 'var(--decision-approval-fg)'
  },
  deny: {
    bg: 'var(--decision-deny-bg)',
    fg: 'var(--decision-deny-fg)'
  }
};
const CATEGORY = {
  cleaning: {
    bg: 'var(--cat-cleaning-bg)',
    fg: 'var(--cat-cleaning-fg)'
  },
  security: {
    bg: 'var(--cat-security-bg)',
    fg: 'var(--cat-security-fg)'
  },
  catering: {
    bg: 'var(--cat-catering-bg)',
    fg: 'var(--cat-catering-fg)'
  },
  bartending: {
    bg: 'var(--cat-bartending-bg)',
    fg: 'var(--cat-bartending-fg)'
  },
  dj: {
    bg: 'var(--cat-dj-bg)',
    fg: 'var(--cat-dj-fg)'
  },
  photography: {
    bg: 'var(--cat-photography-bg)',
    fg: 'var(--cat-photography-fg)'
  },
  decoration: {
    bg: 'var(--cat-decoration-bg)',
    fg: 'var(--cat-decoration-fg)'
  },
  equipment: {
    bg: 'var(--cat-equipment-bg)',
    fg: 'var(--cat-equipment-fg)'
  },
  staff: {
    bg: 'var(--cat-staff-bg)',
    fg: 'var(--cat-staff-fg)'
  }
};
function Badge({
  tone = 'neutral',
  status,
  category,
  risk,
  decision,
  capitalize = true,
  children,
  style = {},
  ...rest
}) {
  let palette = TONES[tone] || TONES.neutral;
  if (status) palette = TONES[STATUS_TONE[status]] || TONES.neutral;
  if (category) palette = CATEGORY[category] || TONES.neutral;
  if (risk) palette = RISK[risk] || TONES.neutral;
  if (decision) palette = DECISION[decision] || TONES.neutral;
  const label = children || status || category || risk || decision || '';
  const text = typeof label === 'string' ? label.replace(/_/g, ' ') : label;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-semibold)',
      lineHeight: 1.4,
      padding: '0.25rem 0.625rem',
      borderRadius: 'var(--radius-full)',
      textTransform: capitalize ? 'capitalize' : 'none',
      background: palette.bg,
      color: palette.fg,
      ...style
    }
  }, rest), text);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * VenuePlus Button.
 * Variants: primary (deep teal), accent (warm coral CTA), outline, ghost.
 * Sizes: sm, md, lg. Optional leading/trailing icon, fullWidth, loading.
 */
function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  leadingIcon = null,
  trailingIcon = null,
  type = 'button',
  onClick,
  children,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      padding: '0.5rem 0.875rem',
      fontSize: 'var(--text-sm)',
      gap: '0.375rem'
    },
    md: {
      padding: '0.75rem 1.5rem',
      fontSize: 'var(--text-base)',
      gap: '0.5rem'
    },
    lg: {
      padding: '1rem 2rem',
      fontSize: 'var(--text-lg)',
      gap: '0.5rem'
    }
  };
  const variants = {
    primary: {
      background: 'var(--primary-500)',
      color: 'var(--white)',
      border: '2px solid transparent'
    },
    accent: {
      background: 'var(--accent-500)',
      color: 'var(--white)',
      border: '2px solid transparent'
    },
    outline: {
      background: 'transparent',
      color: 'var(--primary-500)',
      border: '2px solid var(--primary-500)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--neutral-700)',
      border: '2px solid transparent'
    }
  };
  const [hover, setHover] = React.useState(false);
  const isDisabled = disabled || loading;
  const hoverBg = {
    primary: 'var(--primary-600)',
    accent: 'var(--accent-600)',
    outline: 'var(--primary-50)',
    ghost: 'var(--neutral-100)'
  };
  const v = variants[variant] || variants.primary;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    onClick: isDisabled ? undefined : onClick,
    disabled: isDisabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: sizes[size].gap,
      fontFamily: 'var(--font-sans)',
      fontWeight: 'var(--weight-medium)',
      lineHeight: 1,
      borderRadius: 'var(--radius-md)',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.5 : 1,
      width: fullWidth ? '100%' : 'auto',
      transition: 'var(--transition-colors)',
      ...sizes[size],
      ...v,
      background: hover && !isDisabled ? hoverBg[variant] : v.background,
      ...style
    }
  }, rest), loading ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: '1em',
      height: '1em',
      borderRadius: '50%',
      border: '2px solid currentColor',
      borderTopColor: 'transparent',
      display: 'inline-block',
      animation: 'vp-spin 0.6s linear infinite'
    }
  }) : leadingIcon, children, !loading && trailingIcon, /*#__PURE__*/React.createElement("style", null, `@keyframes vp-spin{to{transform:rotate(360deg)}}`));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * VenuePlus surface card. White, rounded-xl, soft shadow that lifts on hover.
 * Set `interactive` for the hover lift (used on venue/service cards).
 */
function Card({
  interactive = false,
  padding = 'md',
  as = 'div',
  children,
  style = {},
  onClick,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const Tag = as;
  const pads = {
    none: 0,
    sm: 'var(--space-4)',
    md: 'var(--space-5)',
    lg: 'var(--space-6)'
  };
  return /*#__PURE__*/React.createElement(Tag, _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: interactive && hover ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
      overflow: 'hidden',
      padding: pads[padding] ?? pads.md,
      transition: 'var(--transition-shadow), transform var(--duration-base) var(--ease-standard)',
      cursor: interactive ? 'pointer' : 'default',
      transform: interactive && hover ? 'translateY(-2px)' : 'none',
      textDecoration: 'none',
      color: 'inherit',
      display: 'block',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * VenuePlus checkbox with label. Teal when checked.
 */
function Checkbox({
  label,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  id,
  ...rest
}) {
  const reactId = React.useId();
  const boxId = id || reactId;
  const isControlled = checked !== undefined;
  const [internal, setInternal] = React.useState(!!defaultChecked);
  const isChecked = isControlled ? checked : internal;
  const handle = e => {
    if (!isControlled) setInternal(e.target.checked);
    onChange && onChange(e);
  };
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: boxId,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-base)',
      color: 'var(--neutral-700)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      userSelect: 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      width: '1.15rem',
      height: '1.15rem',
      flexShrink: 0,
      borderRadius: 'var(--radius-sm)',
      border: `2px solid ${isChecked ? 'var(--primary-500)' : 'var(--neutral-300)'}`,
      background: isChecked ? 'var(--primary-500)' : 'var(--white)',
      transition: 'var(--transition-colors)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, isChecked && /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "white",
    strokeWidth: "3.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  })), /*#__PURE__*/React.createElement("input", _extends({
    id: boxId,
    type: "checkbox",
    checked: isChecked,
    onChange: handle,
    disabled: disabled,
    style: {
      position: 'absolute',
      opacity: 0,
      width: '100%',
      height: '100%',
      margin: 0,
      cursor: 'inherit'
    }
  }, rest))), label);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * VenuePlus text input with optional label, leading icon, and error state.
 * Mirrors the app's `.input-field` — full-width, rounded-lg, teal focus ring.
 */
function Input({
  label,
  type = 'text',
  placeholder,
  value,
  defaultValue,
  onChange,
  leadingIcon = null,
  error = '',
  disabled = false,
  id,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || (label ? `vp-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      fontFamily: 'var(--font-sans)'
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      display: 'block',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-medium)',
      color: 'var(--neutral-700)',
      marginBottom: '0.25rem'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    }
  }, leadingIcon && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: '0.875rem',
      display: 'flex',
      color: 'var(--neutral-400)',
      pointerEvents: 'none'
    }
  }, leadingIcon), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    type: type,
    placeholder: placeholder,
    value: value,
    defaultValue: defaultValue,
    onChange: onChange,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: '100%',
      padding: leadingIcon ? '0.75rem 1rem 0.75rem 2.5rem' : '0.75rem 1rem',
      fontSize: 'var(--text-base)',
      fontFamily: 'var(--font-sans)',
      color: 'var(--neutral-900)',
      background: disabled ? 'var(--neutral-100)' : 'var(--white)',
      border: `1px solid ${error ? 'var(--status-error-fg)' : focus ? 'var(--primary-500)' : 'var(--neutral-300)'}`,
      borderRadius: 'var(--radius-md)',
      outline: 'none',
      boxShadow: focus && !error ? '0 0 0 2px var(--primary-100)' : 'none',
      transition: 'var(--transition-colors)',
      cursor: disabled ? 'not-allowed' : 'text',
      ...style
    }
  }, rest))), error && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--status-error-fg)',
      marginTop: '0.25rem'
    }
  }, error));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * VenuePlus select / dropdown. Same shape as Input — rounded-lg, teal focus.
 * Pass `options` as [{value,label}] or render <option> children.
 */
function Select({
  label,
  options = [],
  value,
  defaultValue,
  onChange,
  disabled = false,
  id,
  children,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const selectId = id || (label ? `vp-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      fontFamily: 'var(--font-sans)'
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: selectId,
    style: {
      display: 'block',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-medium)',
      color: 'var(--neutral-700)',
      marginBottom: '0.25rem'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: selectId,
    value: value,
    defaultValue: defaultValue,
    onChange: onChange,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: '100%',
      appearance: 'none',
      WebkitAppearance: 'none',
      padding: '0.75rem 2.5rem 0.75rem 1rem',
      fontSize: 'var(--text-base)',
      fontFamily: 'var(--font-sans)',
      color: 'var(--neutral-900)',
      background: disabled ? 'var(--neutral-100)' : 'var(--white)',
      border: `1px solid ${focus ? 'var(--primary-500)' : 'var(--neutral-300)'}`,
      borderRadius: 'var(--radius-md)',
      outline: 'none',
      boxShadow: focus ? '0 0 0 2px var(--primary-100)' : 'none',
      transition: 'var(--transition-colors)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      ...style
    }
  }, rest), children || options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label))), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      color: 'var(--neutral-500)',
      fontSize: '0.7rem'
    }
  }, "\u25BC")));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Select.jsx", error: String((e && e.message) || e) }); }

// components/core/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * VenuePlus pill tabs — the rounded filter row used on the Services and
 * Bookings pages. Active pill is teal; inactive is neutral-100.
 * Controlled (value+onChange) or uncontrolled (defaultValue).
 */
function Tabs({
  items = [],
  value,
  defaultValue,
  onChange,
  style = {},
  ...rest
}) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue ?? (items[0] && items[0].value));
  const active = isControlled ? value : internal;
  const select = val => {
    if (!isControlled) setInternal(val);
    onChange && onChange(val);
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--space-2)',
      ...style
    }
  }, rest), items.map(item => {
    const on = item.value === active;
    return /*#__PURE__*/React.createElement("button", {
      key: item.value,
      type: "button",
      onClick: () => select(item.value),
      style: {
        padding: '0.5rem 1rem',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--weight-medium)',
        borderRadius: 'var(--radius-full)',
        border: 'none',
        cursor: 'pointer',
        transition: 'var(--transition-colors)',
        background: on ? 'var(--primary-500)' : 'var(--neutral-100)',
        color: on ? 'var(--white)' : 'var(--neutral-600)',
        textTransform: item.capitalize ? 'capitalize' : 'none'
      }
    }, item.label, item.count !== undefined && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: '0.35rem',
        opacity: 0.8
      }
    }, "(", item.count, ")"));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/operator/KpiCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * VenuePlus Mission Control KPI tile. A bordered white card with a small
 * label and a large value; optional accent color and delta caption.
 */
function KpiCard({
  label,
  value,
  accent,
  delta,
  deltaTone = 'neutral',
  style = {},
  ...rest
}) {
  const deltaColors = {
    up: 'var(--status-success-fg)',
    down: 'var(--status-error-fg)',
    neutral: 'var(--text-muted)'
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      fontFamily: 'var(--font-sans)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)'
    }
  }, label), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 0',
      fontSize: 'var(--text-2xl)',
      fontWeight: 'var(--weight-bold)',
      lineHeight: 1.1,
      color: accent || 'var(--text-strong)'
    }
  }, value), delta && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontSize: 'var(--text-xs)',
      color: deltaColors[deltaTone]
    }
  }, delta));
}
Object.assign(__ds_scope, { KpiCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/operator/KpiCard.jsx", error: String((e && e.message) || e) }); }

// guidelines/agent-manual/data.js
try { (() => {
/* VenuePlus — Agent Operations Manual data.
   14 agents across 5 facet groups. Autonomy follows the "balanced" policy:
   agents draft everything; the operator approves anything outbound,
   customer-facing, financial, or legal. Money movement & legal are hard-gated. */
(function () {
  // autonomy badge kinds → token-driven colors (see styles.css)
  // auto (green) · draft (amber) · gated (orange) · hardgate (red)
  const FACETS = [{
    id: 'supply-growth',
    name: 'Supply Growth',
    color: 'var(--primary-500)',
    soft: 'var(--primary-50)',
    blurb: 'Find and recruit new venues & service providers.'
  }, {
    id: 'demand-growth',
    name: 'Demand Growth',
    color: 'var(--accent-600)',
    soft: 'var(--accent-50)',
    blurb: 'Generate renter demand across SEO, social & lifecycle.'
  }, {
    id: 'onboarding-net',
    name: 'Onboarding & Network',
    color: '#15803d',
    soft: '#dcfce7',
    blurb: 'Get supply live and keep every booking serviceable.'
  }, {
    id: 'operations',
    name: 'Marketplace Operations',
    color: '#1d4ed8',
    soft: '#dbeafe',
    blurb: 'Run bookings, trust & safety, and the money.'
  }, {
    id: 'customer-plat',
    name: 'Customer & Platform',
    color: '#7e22ce',
    soft: '#f3e8ff',
    blurb: 'Support every party; watch the whole system.'
  }];

  // autonomy: 'auto' | 'draft' | 'gated' | 'hardgate'
  const A = {
    auto: {
      label: 'Autonomous',
      kind: 'auto',
      note: 'Acts alone (read / internal writes).'
    },
    draft: {
      label: 'Drafts → you approve',
      kind: 'draft',
      note: 'Drafts everything; outbound / customer-facing needs approval.'
    },
    gated: {
      label: 'Approval-gated',
      kind: 'gated',
      note: 'Consequential actions need your sign-off.'
    },
    hardgate: {
      label: 'Hard gate · money',
      kind: 'hardgate',
      note: 'All money movement requires explicit approval.'
    }
  };
  const AGENTS = [/* ---------------- Supply Growth ---------------- */
  {
    id: 'discovery',
    name: 'Discovery',
    facet: 'supply-growth',
    autonomy: 'auto',
    mandate: 'Continuously find new commercial spaces and service providers worth recruiting.',
    responsibilities: ['Scan Google Places, Yelp, Instagram & commercial listing sites for candidate venues and providers.', 'Maintain supply coverage targets by city and by venue / service category.', 'Detect and skip entities already in the marketplace (dedupe at the source).', 'Prioritize discovery where demand outpaces available supply.', 'Feed a clean stream of raw leads to Enrichment.'],
    tasks: ['Run scheduled geo-sweeps for each launch city.', 'Pull only listings created or changed since the last crawl.', 'Tag every lead with type (rooftop, warehouse, field…) or service category.', 'Queue qualified raw leads for enrichment.', 'Log coverage and source-health stats.'],
    tools: ['Google Places API', 'Yelp Fusion', 'Instagram location search', 'Leads DB', 'Dedupe service'],
    autonomyNote: 'Fully autonomous — read-only collection, no outbound contact. Writes leads to the internal DB without approval.',
    escalations: ['A city\u2019s supply coverage drops below target.', 'A data source rate-limits or breaks.', 'Zero new leads found in a category for 7+ days.'],
    kpis: ['New qualified leads / week', 'City coverage %', 'Duplicate rate', 'Source uptime'],
    handoffs: '→ Enrichment'
  }, {
    id: 'enrichment',
    name: 'Enrichment',
    facet: 'supply-growth',
    autonomy: 'auto',
    mandate: 'Turn raw leads into complete, contactable, deduplicated records.',
    responsibilities: ['Resolve owner / manager emails and phone numbers.', 'Attach social handles, websites, and firmographic detail.', 'Verify email deliverability before anything is queued for outreach.', 'Merge duplicates across sources into a single record.', 'Fill missing attributes — capacity, type, operating hours.'],
    tasks: ['Run Hunter.io email lookups for each lead.', 'Score deliverability / bounce risk.', 'Enrich firmographics and category metadata.', 'Collapse duplicate leads.', 'Write the enriched record back to the leads DB.'],
    tools: ['Hunter.io', 'Email verification API', 'Enrichment provider', 'Leads DB'],
    autonomyNote: 'Fully autonomous — read / enrich / internal-write only. No outbound contact.',
    escalations: ['Batch deliverability is poor.', 'An enrichment provider quota is exhausted.', 'A lead has no contactable channel at all.'],
    kpis: ['Contactable rate', 'Email verification accuracy', 'Enrichment cost / lead', 'Duplicates merged'],
    handoffs: '← Discovery   → Scoring'
  }, {
    id: 'scoring',
    name: 'Scoring',
    facet: 'supply-growth',
    autonomy: 'auto',
    mandate: 'Rank every lead 0–100 so outreach effort goes where it converts.',
    responsibilities: ['Score leads on fit, demand match, reachability, and revenue potential.', 'Auto-queue strong leads (≥ 60) for outreach.', 'Suppress weak or poor-fit leads.', 'Recalibrate the model against real booking outcomes.', 'Keep the score distribution healthy and explainable.'],
    tasks: ['Compute lead scores nightly.', 'Segment leads into hot / warm / cold tiers.', 'Push hot leads to the Outreach queue.', 'Report score distribution to Mission Control.', 'Retrain weights on closed-won data.'],
    tools: ['Scoring model', 'Bookings / outcomes DB', 'Feature store'],
    autonomyNote: 'Autonomous for compute & queueing. Changing the auto-queue threshold (the ≥ 60 bar) requires your approval.',
    escalations: ['Conversion of "hot" leads drops (score drift).', 'You would need to change the auto-queue threshold.', 'An entire segment scores uniformly low.'],
    kpis: ['Hot-lead conversion', 'Score → booking correlation', 'Queue volume', 'Model drift'],
    handoffs: '← Enrichment   → Outreach'
  }, {
    id: 'outreach',
    name: 'Outreach',
    facet: 'supply-growth',
    autonomy: 'draft',
    mandate: 'Win new venues and providers through personalized, on-brand cold outreach.',
    responsibilities: ['Draft tailored cold emails per lead with Claude.', 'Sequence intelligent follow-ups.', 'Personalize by venue type and local demand signals.', 'A/B test angles and subject lines.', 'Never contact opted-out or suppressed leads.'],
    tasks: ['Generate drafts for the hot-lead queue.', 'Assemble multi-step follow-up sequences.', 'Submit every outbound send for your approval.', 'Record replies and auto-pause on response.', 'Hand interested leads to Onboarding.'],
    tools: ['Claude', 'Email send service', 'Suppression list', 'CRM'],
    autonomyNote: 'Drafts everything autonomously; every outbound email requires your approval. Auto-pauses a sequence the moment a lead replies.',
    escalations: ['Every first-touch send (approval).', 'Negative or complaint replies.', 'Opt-out / spam reports.', 'A lead requesting a call.'],
    kpis: ['Reply rate', 'Positive-reply rate', 'Venues / providers signed', 'Spam-complaint rate'],
    handoffs: '← Scoring   → Onboarding'
  }, /* ---------------- Demand Growth ---------------- */
  {
    id: 'seo',
    name: 'SEO & Content',
    facet: 'demand-growth',
    autonomy: 'draft',
    mandate: 'Grow organic demand with venue listing pages and helpful local content.',
    responsibilities: ['Generate and maintain SEO listing pages per venue, city, and type.', 'Write blog and guide content around local event search intent.', 'Manage metadata, schema, and internal linking.', 'Track keyword rankings and refresh stale pages.', 'Protect against thin or duplicate content.'],
    tasks: ['Draft new landing pages from venue data.', 'Produce meta titles and descriptions within limits.', 'Build topical guides ("rooftop venues in Nashville").', 'Queue pages for publish approval.', 'Monitor keyword positions in Search Console.'],
    tools: ['Claude', 'CMS / Next.js content', 'Search Console', 'Keyword API', 'Schema generator'],
    autonomyNote: 'Drafts everything; publishing live pages or content requires your approval. Metadata tweaks to already-live pages run automatically.',
    escalations: ['First publish of a content batch.', 'Ranking drops on priority terms.', 'Indexing errors.', 'Thin / duplicate-content risk detected.'],
    kpis: ['Organic sessions', 'Indexed pages', 'Top-10 keywords', 'Page → booking rate'],
    handoffs: '→ Campaign   ← Monitor'
  }, {
    id: 'social',
    name: 'Social Media',
    facet: 'demand-growth',
    autonomy: 'draft',
    mandate: 'Build brand presence and demand across social channels.',
    responsibilities: ['Draft Facebook & Instagram posts featuring venues and events.', 'Maintain a content calendar with consistent cadence.', 'Draft replies to comments and DMs.', 'Spotlight new and featured listings.', 'Keep voice and visuals on-brand.'],
    tasks: ['Generate weekly post drafts with imagery.', 'Schedule the content calendar.', 'Draft replies to inbound comments / DMs.', 'Flag user content worth resharing.', 'Route support-type DMs to Support.'],
    tools: ['Claude', 'Meta Graph API', 'Asset library', 'Scheduler'],
    autonomyNote: 'Drafts everything; every public post and public reply requires your approval.',
    escalations: ['Each post and reply (approval).', 'Negative public comments or PR-sensitive mentions.', 'DMs that are really support or safety issues.'],
    kpis: ['Reach', 'Engagement rate', 'Follower growth', 'Social → site clicks'],
    handoffs: '→ Support'
  }, {
    id: 'campaign',
    name: 'Lifecycle Campaigns',
    facet: 'demand-growth',
    autonomy: 'draft',
    mandate: 'Convert and retain venues, providers, and renters with lifecycle email & SMS.',
    responsibilities: ['Run drip sequences — welcome, activation, win-back.', 'Segment audiences by role and behavior.', 'Trigger behavior-based messages.', 'Suppress over-mailing and respect frequency caps.', 'Measure incremental lift, not just opens.'],
    tasks: ['Enroll users into the right journeys.', 'Draft each step of every sequence.', 'Submit customer sends for approval.', 'Prune unengaged contacts.', 'Report cohort performance.'],
    tools: ['Claude', 'ESP (drip)', 'Segmentation DB', 'Analytics'],
    autonomyNote: 'Drafts journeys and content; campaign sends to customers require your approval. Auto-suppression and journey exits are automatic.',
    escalations: ['New campaign launch.', 'Unsubscribe spikes.', 'Deliverability drops.', 'A key segment going stale.'],
    kpis: ['Activation rate', 'Repeat-booking rate', 'Win-back / churn', 'Unsubscribe rate'],
    handoffs: '← SEO   ← Onboarding'
  }, /* ---------------- Onboarding & Network ---------------- */
  {
    id: 'onboarding',
    name: 'Onboarding',
    facet: 'onboarding-net',
    autonomy: 'draft',
    mandate: 'Get signed venues and providers fully live, fast — complete, priced, and bookable.',
    responsibilities: ['Guide new hosts / providers through profile, photos, pricing, and availability.', 'Apply required-service rules to each new venue.', 'Validate listing completeness before activation.', 'Set fair starting prices from local comparables.', 'Schedule first-listing check-ins and unblock stalled setups.'],
    tasks: ['Send tailored setup checklists.', 'Draft profile copy from host inputs.', 'Suggest pricing from local comps.', 'Verify photos, capacity, and availability.', 'Flip completed listings to active (on approval).'],
    tools: ['Claude', 'Listings DB', 'Pricing-comps engine', 'Media validation', 'Email'],
    autonomyNote: 'Drafts profiles & pricing; activating a listing and any host-facing message require your approval. Internal completeness checks are automatic.',
    escalations: ['A listing stalls for more than 7 days.', 'Missing legal or insurance documents.', 'Pricing far outside local comps.', 'A host requesting hands-on help.'],
    kpis: ['Time-to-active', 'Listing completeness %', 'Time to first booking', 'Activation rate'],
    handoffs: '← Outreach   → Network   → Trust & Safety   → Campaign'
  }, {
    id: 'network',
    name: 'Provider Network',
    facet: 'onboarding-net',
    autonomy: 'draft',
    mandate: 'Ensure every booking can be fully serviced — the right providers, available, in range.',
    responsibilities: ['Map provider coverage by category, geography, and capacity.', 'Detect service gaps before they block bookings.', 'Match required services to each booking.', 'Balance load fairly across providers.', 'Signal Discovery where coverage is thin.'],
    tasks: ['Maintain the live coverage map.', 'Auto-match providers to new bookings.', 'Rank providers by rating, proximity, and price.', 'Flag unserviceable areas and categories.', 'Draft and dispatch service requests (on approval).'],
    tools: ['Coverage / geo engine', 'Providers DB', 'Bookings DB', 'Ranking model'],
    autonomyNote: 'Auto-matches and ranks; dispatching a paid service request to a provider requires your approval (it is outbound + financial). Coverage analysis is automatic.',
    escalations: ['A booking is unserviceable (no provider).', 'Single-provider dependency in a category / city.', 'A provider repeatedly declining.', 'A coverage gap in a growth market.'],
    kpis: ['% bookings fully serviced', 'Unserviceable count', 'Match acceptance rate', 'Provider utilization'],
    handoffs: '← Onboarding   → Bookings   → Discovery'
  }, /* ---------------- Marketplace Operations ---------------- */
  {
    id: 'bookings',
    name: 'Bookings & Ops',
    facet: 'operations',
    autonomy: 'gated',
    mandate: 'Run the booking lifecycle end to end — reliably and within policy.',
    responsibilities: ['Process new bookings and hold inventory.', 'Handle date / time changes and cancellations.', 'Apply cancellation & refund policy consistently.', 'Coordinate venue + required services into one confirmed order.', 'Manage disputes with drafted, policy-grounded resolutions.'],
    tasks: ['Confirm bookings and recompute totals on changes.', 'Classify cancellations against policy.', 'Assemble refund / credit proposals for approval.', 'Coordinate services with Provider Network.', 'Log dispute timelines and outcomes.'],
    tools: ['Bookings DB', 'Calendar / inventory', 'Policy engine', 'Claude'],
    autonomyNote: 'Auto-handles confirmations, holds, and policy classification; refunds, goodwill credits, and customer-facing dispute messages require your approval (refunds are hard-gated via Finance).',
    escalations: ['Any refund or credit (approval).', 'Cancellation inside the penalty window.', 'A double-booking / inventory conflict.', 'A dispute unresolvable by policy.'],
    kpis: ['Booking completion rate', 'On-time confirmation', 'Dispute rate', 'Avg resolution time'],
    handoffs: '← Network   → Finance   → Trust & Safety   → Support'
  }, {
    id: 'trust',
    name: 'Trust & Safety',
    facet: 'operations',
    autonomy: 'gated',
    mandate: 'Keep the marketplace safe, verified, insured, and compliant.',
    responsibilities: ['Verify host & provider identity and licenses.', 'Confirm insurance coverage on venues and services.', 'Screen transactions and accounts for fraud.', 'Enforce required-service and permit rules.', 'Manage suspensions and appeals.'],
    tasks: ['Run identity / license checks at onboarding.', 'Validate insurance certificates and expiries.', 'Score transactions for fraud risk.', 'Review flagged listings and users.', 'Draft suspension / appeal notices.'],
    tools: ['KYC / identity API', 'Insurance-cert validation', 'Fraud-scoring model', 'Document OCR', 'Claude'],
    autonomyNote: 'Auto-runs checks and risk scoring; suspensions, reinstatements, and any compliance / legal communication require your approval. Legal actions are hard-gated.',
    escalations: ['Failed identity / license verification.', 'Expired or invalid insurance.', 'Suspected fraud.', 'Legal / regulatory notices or a safety incident.'],
    kpis: ['% listings verified', 'Insurance-valid rate', 'Fraud caught vs missed', 'Time-to-verify'],
    handoffs: '← Onboarding   ← Bookings   → Finance'
  }, {
    id: 'finance',
    name: 'Finance & Payouts',
    facet: 'operations',
    autonomy: 'hardgate',
    mandate: 'Move money correctly — collect, hold, pay out, reconcile, and report.',
    responsibilities: ['Capture renter payments and split platform fees.', 'Schedule host & provider payouts on completion.', 'Execute operator-approved refunds.', 'Reconcile daily against the payment processor.', 'Produce GMV, fee, and P&L reporting.'],
    tasks: ['Authorize / capture on booking.', 'Compute fee splits per order.', 'Queue payouts for your approval.', 'Execute approved refunds.', 'Run daily reconciliation and reports.'],
    tools: ['Stripe Connect', 'Ledger DB', 'Reconciliation engine', 'Reporting / BI'],
    autonomyNote: 'Auto-captures pre-authorized payments and produces reports; every payout, refund, and adjustment requires your approval — all money movement is hard-gated.',
    escalations: ['Every payout / refund (approval).', 'A reconciliation mismatch.', 'A failed payment or chargeback.', 'A processor incident or negative-balance risk.'],
    kpis: ['GMV', 'Fee revenue', 'Payout accuracy', 'Reconciliation variance', 'Chargeback rate'],
    handoffs: '← Bookings   ← Trust & Safety'
  }, /* ---------------- Customer & Platform ---------------- */
  {
    id: 'support',
    name: 'Support',
    facet: 'customer-plat',
    autonomy: 'draft',
    mandate: 'Resolve renter, host, and provider questions fast — and escalate what it can\u2019t.',
    responsibilities: ['Answer inbound across email and chat.', 'Triage by topic and urgency.', 'Draft accurate, on-brand replies grounded in policy and booking data.', 'Route operational issues to the right agent.', 'Capture recurring feedback and gaps.'],
    tasks: ['Classify and prioritize tickets.', 'Draft replies with full booking context.', 'Suggest macros for common cases.', 'Hand off refunds → Bookings, fraud → Trust & Safety.', 'Tag recurring issues for the team.'],
    tools: ['Helpdesk', 'Claude', 'Knowledge base', 'Bookings / CRM context'],
    autonomyNote: 'Drafts every reply; customer-facing responses require your approval — or auto-send for a vetted FAQ set you explicitly enable. Routing and tagging are automatic.',
    escalations: ['Anything involving money, safety, or legal.', 'Angry or at-risk customers.', 'VIP hosts.', 'Tickets it can\u2019t answer from policy.'],
    kpis: ['First-response time', 'Resolution time', 'CSAT', 'Deflection rate'],
    handoffs: '→ Bookings   → Trust & Safety   → Finance'
  }, {
    id: 'monitor',
    name: 'Workflow Monitor',
    facet: 'customer-plat',
    autonomy: 'auto',
    mandate: 'Watch the whole system and catch problems before they spread.',
    responsibilities: ['Detect funnel anomalies across supply, demand, conversion, and ops.', 'Watch agent health and queue backlogs.', 'Surface quality issues — bad reviews, SLA breaches.', 'Run daily end-to-end health checks.', 'Recommend concrete interventions.'],
    tasks: ['Run hourly anomaly scans.', 'Track each agent\u2019s throughput and error rate.', 'Flag SLA and queue breaches.', 'Compile the daily health digest.', 'Open escalations with proposed fixes.'],
    tools: ['Metrics / observability', 'Anomaly model', 'Reviews DB', 'Alerting'],
    autonomyNote: 'Fully autonomous — read-only observation, scoring, and alerting. Never acts on the business directly; it only opens escalations for you or another agent.',
    escalations: ['Any metric breaching threshold.', 'An agent failing or stalling.', 'A backlog building in the approval queue.', 'A cluster of bad reviews.'],
    kpis: ['Anomalies caught', 'False-positive rate', 'Mean-time-to-detect', 'System uptime'],
    handoffs: '→ all agents'
  }];
  window.MANUAL = {
    FACETS,
    AGENTS,
    A
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "guidelines/agent-manual/data.js", error: String((e && e.message) || e) }); }

// guidelines/agent-manual/manual.jsx
try { (() => {
/* Agent Operations Manual — interactive two-pane reference. */
const {
  useState: useManualState
} = React;
const {
  FACETS,
  AGENTS,
  A
} = window.MANUAL;
const AUT_COLORS = {
  auto: {
    bg: 'var(--decision-auto-bg)',
    fg: 'var(--decision-auto-fg)'
  },
  draft: {
    bg: 'var(--decision-approval-bg)',
    fg: 'var(--decision-approval-fg)'
  },
  gated: {
    bg: 'var(--risk-financial-bg)',
    fg: 'var(--risk-financial-fg)'
  },
  hardgate: {
    bg: 'var(--risk-money-bg)',
    fg: 'var(--risk-money-fg)'
  }
};
const facetOf = id => FACETS.find(f => f.id === id);
function AutBadge({
  kind,
  children
}) {
  const c = AUT_COLORS[kind];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 11.5,
      fontWeight: 600,
      padding: '3px 9px',
      borderRadius: 'var(--radius-full)',
      background: c.bg,
      color: c.fg,
      whiteSpace: 'nowrap'
    }
  }, children || A[kindToKey(kind)].label);
}
function kindToKey(kind) {
  return Object.keys(A).find(k => A[k].kind === kind);
}
function Chip({
  children,
  color
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      padding: '4px 10px',
      borderRadius: 'var(--radius-full)',
      background: 'var(--neutral-100)',
      color: color || 'var(--neutral-700)',
      fontWeight: 500
    }
  }, children);
}
function ListRow({
  agent,
  active,
  onClick
}) {
  const f = facetOf(agent.facet);
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      width: '100%',
      textAlign: 'left',
      border: 'none',
      cursor: 'pointer',
      padding: '10px 12px',
      borderRadius: 'var(--radius-md)',
      background: active ? 'var(--primary-50)' : 'transparent',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: f.color,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 14,
      fontWeight: 600,
      color: active ? 'var(--primary-700)' : 'var(--neutral-800)'
    }
  }, agent.name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 11.5,
      color: 'var(--text-subtle)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, agent.id)), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: AUT_COLORS[agent.autonomy].fg,
      flexShrink: 0
    },
    title: A[kindToKey(agent.autonomy)].label
  }));
}
function Section({
  title,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 22
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 10px',
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '.06em',
      textTransform: 'uppercase',
      color: 'var(--text-subtle)'
    }
  }, title), children);
}
function Bullets({
  items,
  warn
}) {
  return /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, items.map((t, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      display: 'flex',
      gap: 10,
      fontSize: 14,
      lineHeight: 1.5,
      color: 'var(--neutral-700)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: warn ? 'var(--status-pending-fg)' : 'var(--primary-500)',
      flexShrink: 0,
      fontWeight: 700,
      marginTop: 1
    }
  }, warn ? '▸' : '•'), /*#__PURE__*/React.createElement("span", null, t))));
}
function Detail({
  agent
}) {
  const f = facetOf(agent.facet);
  const aut = A[kindToKey(agent.autonomy)];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '28px 32px',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      padding: '3px 10px',
      borderRadius: 'var(--radius-full)',
      background: f.soft,
      color: f.color
    }
  }, f.name), /*#__PURE__*/React.createElement(AutBadge, {
    kind: agent.autonomy
  }), /*#__PURE__*/React.createElement("code", {
    style: {
      fontSize: 12,
      color: 'var(--text-subtle)',
      fontFamily: 'ui-monospace, monospace'
    }
  }, "agent: ", agent.id)), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '14px 0 6px',
      fontSize: 28,
      fontWeight: 800,
      letterSpacing: '-.02em',
      color: 'var(--neutral-900)'
    }
  }, agent.name), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 17,
      lineHeight: 1.5,
      color: 'var(--neutral-600)',
      maxWidth: '54ch'
    }
  }, agent.mandate), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0 40px'
    }
  }, /*#__PURE__*/React.createElement(Section, {
    title: "Core responsibilities"
  }, /*#__PURE__*/React.createElement(Bullets, {
    items: agent.responsibilities
  })), /*#__PURE__*/React.createElement(Section, {
    title: "Day-to-day tasks"
  }, /*#__PURE__*/React.createElement(Bullets, {
    items: agent.tasks
  }))), /*#__PURE__*/React.createElement(Section, {
    title: "Tools & integrations"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8
    }
  }, agent.tools.map(t => /*#__PURE__*/React.createElement(Chip, {
    key: t
  }, t)))), /*#__PURE__*/React.createElement(Section, {
    title: "Autonomy \u2014 what it does alone vs. needs you"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
      background: AUT_COLORS[agent.autonomy].bg,
      border: `1px solid ${AUT_COLORS[agent.autonomy].fg}22`,
      borderRadius: 'var(--radius-lg)',
      padding: '14px 16px'
    }
  }, /*#__PURE__*/React.createElement(AutBadge, {
    kind: agent.autonomy
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14,
      lineHeight: 1.55,
      color: 'var(--neutral-700)'
    }
  }, agent.autonomyNote))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0 40px'
    }
  }, /*#__PURE__*/React.createElement(Section, {
    title: "Escalation triggers \u2192 you"
  }, /*#__PURE__*/React.createElement(Bullets, {
    items: agent.escalations,
    warn: true
  })), /*#__PURE__*/React.createElement(Section, {
    title: "Success metrics (KPIs)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8
    }
  }, agent.kpis.map(k => /*#__PURE__*/React.createElement("span", {
    key: k,
    style: {
      fontSize: 13,
      fontWeight: 600,
      padding: '6px 12px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--primary-50)',
      color: 'var(--primary-700)'
    }
  }, k))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 8px',
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '.06em',
      textTransform: 'uppercase',
      color: 'var(--text-subtle)'
    }
  }, "Handoffs"), /*#__PURE__*/React.createElement("code", {
    style: {
      fontSize: 13,
      color: 'var(--neutral-600)',
      fontFamily: 'ui-monospace, monospace'
    }
  }, agent.handoffs)))));
}
function ManualApp() {
  const [filter, setFilter] = useManualState('all');
  const [sel, setSel] = useManualState(AGENTS[0].id);
  const shown = filter === 'all' ? AGENTS : AGENTS.filter(a => a.facet === filter);
  const selected = AGENTS.find(a => a.id === sel);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-console)'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      background: '#fff',
      borderBottom: '1px solid var(--border-default)',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/venueplus-logo-mark.png",
    alt: "VenuePlus",
    style: {
      height: 40
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 19,
      fontWeight: 800,
      color: 'var(--neutral-900)'
    }
  }, "Agent Operations Manual"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 0',
      fontSize: 13,
      color: 'var(--text-muted)'
    }
  }, "How the VenuePlus fleet runs the business \u2014 one operator, ", AGENTS.length, " agents."))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--alert-bg)',
      borderBottom: '1px solid var(--alert-border)',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      color: 'var(--alert-fg)',
      fontWeight: 500
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Balanced autonomy."), " Agents draft everything; you approve anything outbound, customer-facing, financial, or legal."), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginLeft: 'auto'
    }
  }, /*#__PURE__*/React.createElement(AutBadge, {
    kind: "auto"
  }), /*#__PURE__*/React.createElement(AutBadge, {
    kind: "draft"
  }), /*#__PURE__*/React.createElement(AutBadge, {
    kind: "gated"
  }), /*#__PURE__*/React.createElement(AutBadge, {
    kind: "hardgate"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      borderRight: '1px solid var(--border-default)',
      background: '#fff',
      overflowY: 'auto',
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(FacetChip, {
    id: "all",
    label: "All",
    active: filter === 'all',
    onClick: () => setFilter('all')
  }), FACETS.map(f => /*#__PURE__*/React.createElement(FacetChip, {
    key: f.id,
    id: f.id,
    label: f.name,
    color: f.color,
    active: filter === f.id,
    onClick: () => setFilter(f.id)
  }))), (filter === 'all' ? FACETS : FACETS.filter(f => f.id === filter)).map(f => {
    const rows = shown.filter(a => a.facet === f.id);
    if (!rows.length) return null;
    return /*#__PURE__*/React.createElement("div", {
      key: f.id,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '.05em',
        textTransform: 'uppercase',
        color: f.color,
        padding: '4px 12px'
      }
    }, f.name), rows.map(a => /*#__PURE__*/React.createElement(ListRow, {
      key: a.id,
      agent: a,
      active: a.id === sel,
      onClick: () => setSel(a.id)
    })));
  })), /*#__PURE__*/React.createElement("main", {
    style: {
      overflowY: 'auto',
      background: '#fff'
    }
  }, selected && /*#__PURE__*/React.createElement(Detail, {
    agent: selected
  }))));
}
function FacetChip({
  label,
  color,
  active,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      border: `1px solid ${active ? color || 'var(--primary-500)' : 'var(--border-default)'}`,
      background: active ? color || 'var(--primary-500)' : '#fff',
      color: active ? '#fff' : 'var(--neutral-600)',
      cursor: 'pointer',
      borderRadius: 'var(--radius-full)',
      padding: '4px 11px',
      fontSize: 12,
      fontWeight: 500,
      fontFamily: 'var(--font-sans)'
    }
  }, label);
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(ManualApp, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "guidelines/agent-manual/manual.jsx", error: String((e && e.message) || e) }); }

// guidelines/fleet-map/flow.jsx
try { (() => {
/* Fleet Map — how work flows across the 14-agent fleet and through the
   operator approval gate. Loads agent mandates from the Operations Manual data. */
const {
  useState: useFlowState,
  useEffect: useFlowEffect,
  useRef: useFlowRef
} = React;
const {
  FACETS: MF,
  AGENTS: MA,
  A: MAUT
} = window.MANUAL;
const AUT_C = {
  auto: {
    bg: 'var(--decision-auto-bg)',
    fg: 'var(--decision-auto-fg)'
  },
  draft: {
    bg: 'var(--decision-approval-bg)',
    fg: 'var(--decision-approval-fg)'
  },
  gated: {
    bg: 'var(--risk-financial-bg)',
    fg: 'var(--risk-financial-fg)'
  },
  hardgate: {
    bg: 'var(--risk-money-bg)',
    fg: 'var(--risk-money-fg)'
  }
};
const autKey = k => Object.keys(MAUT).find(x => MAUT[x].kind === k);
const facet = id => MF.find(f => f.id === id);
const agentsIn = fid => MA.filter(a => a.facet === fid);
function Chevron() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      color: 'var(--neutral-300)',
      flexShrink: 0,
      padding: '0 2px'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "26",
    height: "26",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "9 18 15 12 9 6"
  })));
}
function AgentChip({
  a,
  onHover,
  dim
}) {
  const f = facet(a.facet);
  const c = AUT_C[a.autonomy];
  return /*#__PURE__*/React.createElement("button", {
    onMouseEnter: () => onHover(a),
    onMouseLeave: () => onHover(null),
    onFocus: () => onHover(a),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      width: '100%',
      textAlign: 'left',
      border: '1px solid var(--border-default)',
      background: '#fff',
      cursor: 'default',
      borderRadius: 'var(--radius-md)',
      padding: '8px 10px',
      fontFamily: 'var(--font-sans)',
      opacity: dim ? 0.4 : 1,
      transition: 'opacity 150ms, box-shadow 150ms, transform 150ms'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: c.fg,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--neutral-800)',
      textTransform: 'capitalize',
      flex: 1
    }
  }, a.name));
}
function Lane({
  fid,
  onHover,
  hovered
}) {
  const f = facet(fid);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      background: '#fff',
      border: `1px solid var(--border-default)`,
      borderTop: `3px solid ${f.color}`,
      borderRadius: 'var(--radius-lg)',
      padding: 14,
      boxShadow: 'var(--shadow-sm)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 700,
      color: f.color
    }
  }, f.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--text-muted)',
      margin: '2px 0 12px',
      minHeight: 30
    }
  }, f.blurb), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, agentsIn(fid).map(a => /*#__PURE__*/React.createElement(AgentChip, {
    key: a.id,
    a: a,
    onHover: onHover,
    dim: hovered && hovered.id !== a.id && hovered.facet !== fid
  }))));
}
function GateChip({
  kind,
  label
}) {
  const c = AUT_C[kind];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      padding: '4px 11px',
      borderRadius: 'var(--radius-full)',
      background: c.bg,
      color: c.fg
    }
  }, label);
}
function FlowApp() {
  const [hovered, setHovered] = useFlowState(null);
  const wrapRef = useFlowRef(null);
  const [scale, setScale] = useFlowState(1);
  useFlowEffect(() => {
    const fit = () => {
      const w = window.innerWidth - 40;
      setScale(Math.min(1, w / 1060));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      background: 'var(--surface-console)'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      background: '#fff',
      borderBottom: '1px solid var(--border-default)',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/venueplus-logo-mark.png",
    alt: "VenuePlus",
    style: {
      height: 40
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 19,
      fontWeight: 800,
      color: 'var(--neutral-900)'
    }
  }, "Fleet Map"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 0',
      fontSize: 13,
      color: 'var(--text-muted)'
    }
  }, "How a goal flows across the fleet \u2014 and everything consequential passes through you."))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 20,
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: wrapRef,
    style: {
      width: 1060,
      transform: `scale(${scale})`,
      transformOrigin: 'top center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'stretch',
      gap: 16,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 320px'
    }
  }, /*#__PURE__*/React.createElement(Lane, {
    fid: "demand-growth",
    onHover: setHovered,
    hovered: hovered
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-subtle)',
      fontSize: 12.5,
      fontStyle: 'italic'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      color: 'var(--accent-600)',
      fontStyle: 'normal'
    }
  }, "Renters discover & book \u2193"), /*#__PURE__*/React.createElement("div", null, "SEO pages, social, and lifecycle campaigns drive demand into the marketplace.")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'stretch',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Lane, {
    fid: "supply-growth",
    onHover: setHovered,
    hovered: hovered
  }), /*#__PURE__*/React.createElement(Chevron, null), /*#__PURE__*/React.createElement(Lane, {
    fid: "onboarding-net",
    onHover: setHovered,
    hovered: hovered
  }), /*#__PURE__*/React.createElement(Chevron, null), /*#__PURE__*/React.createElement(Lane, {
    fid: "operations",
    onHover: setHovered,
    hovered: hovered
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-around',
      fontSize: 11,
      color: 'var(--text-subtle)',
      margin: '8px 0 0',
      fontWeight: 600,
      letterSpacing: '.04em',
      textTransform: 'uppercase'
    }
  }, /*#__PURE__*/React.createElement("span", null, "1 \xB7 Acquire supply"), /*#__PURE__*/React.createElement("span", null, "2 \xB7 Activate & make serviceable"), /*#__PURE__*/React.createElement("span", null, "3 \xB7 Transact & operate")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      background: '#fff',
      border: '1px dashed var(--border-strong)',
      borderRadius: 'var(--radius-lg)',
      padding: '12px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 700,
      color: facet('customer-plat').color,
      whiteSpace: 'nowrap'
    }
  }, "Customer & Platform", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 400,
      color: 'var(--text-muted)',
      fontSize: 11
    }
  }, "spans everything")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flex: 1
    }
  }, agentsIn('customer-plat').map(a => /*#__PURE__*/React.createElement("div", {
    key: a.id,
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(AgentChip, {
    a: a,
    onHover: setHovered,
    dim: hovered && hovered.id !== a.id && hovered.facet !== 'customer-plat'
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      margin: '22px 0 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: -16,
      left: '50%',
      transform: 'translateX(-50%)',
      color: 'var(--neutral-300)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "6 9 12 15 18 9"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--neutral-900)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 20px',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/venueplus-logo-mark.png",
    alt: "",
    style: {
      height: 30,
      filter: 'drop-shadow(0 0 0 #fff)'
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700
    }
  }, "Operator approval gate"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--neutral-400)'
    }
  }, "You \u2014 1 of 1. Agents draft; you decide."))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(GateChip, {
    kind: "auto",
    label: "Auto \xB7 read & internal"
  }), /*#__PURE__*/React.createElement(GateChip, {
    kind: "draft",
    label: "Approve \xB7 outbound / customer-facing"
  }), /*#__PURE__*/React.createElement(GateChip, {
    kind: "gated",
    label: "Approve \xB7 financial"
  }), /*#__PURE__*/React.createElement(GateChip, {
    kind: "hardgate",
    label: "Hard gate \xB7 money & legal"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: 6,
      color: 'var(--neutral-300)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "6 9 12 15 18 9"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      justifyContent: 'center'
    }
  }, ['Customers emailed', 'Money moved', 'Content published', 'Providers dispatched'].map(t => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      background: '#fff',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '9px 16px',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--neutral-700)'
    }
  }, t))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      minHeight: 54,
      background: hovered ? '#fff' : 'transparent',
      border: hovered ? '1px solid var(--border-default)' : '1px dashed var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, hovered ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: 'var(--neutral-900)',
      textTransform: 'capitalize',
      whiteSpace: 'nowrap'
    }
  }, hovered.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 600,
      padding: '3px 9px',
      borderRadius: 'var(--radius-full)',
      background: AUT_C[hovered.autonomy].bg,
      color: AUT_C[hovered.autonomy].fg,
      whiteSpace: 'nowrap'
    }
  }, MAUT[autKey(hovered.autonomy)].label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      color: 'var(--neutral-600)'
    }
  }, hovered.mandate)) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--text-subtle)'
    }
  }, "Hover any agent to see its mandate and autonomy level. Full specs live in the Agent Operations Manual.")))));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(FlowApp, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "guidelines/fleet-map/flow.jsx", error: String((e && e.message) || e) }); }

// ui_kits/disputes/app.jsx
try { (() => {
/* Disputes & Resolutions — case queue, resolution detail, and policy reference. */
const {
  useState: useDispState
} = React;
const D = window.DISPUTES;
const money = n => '$' + Number(n).toLocaleString('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
const SEV = {
  high: {
    bg: 'var(--status-error-bg)',
    fg: 'var(--status-error-fg)'
  },
  medium: {
    bg: 'var(--status-pending-bg)',
    fg: 'var(--status-pending-fg)'
  },
  low: {
    bg: 'var(--neutral-100)',
    fg: 'var(--neutral-600)'
  }
};
const policyById = id => D.POLICIES.find(p => p.id === id);
function CaseRow({
  c,
  active,
  resolved,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      display: 'block',
      width: '100%',
      textAlign: 'left',
      cursor: 'pointer',
      border: 'none',
      borderLeft: `3px solid ${active ? 'var(--primary-500)' : 'transparent'}`,
      background: active ? 'var(--primary-50)' : 'transparent',
      padding: '12px 14px',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: 999,
      background: SEV[c.severity].bg,
      color: SEV[c.severity].fg,
      textTransform: 'capitalize'
    }
  }, c.severity), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: 'var(--text-subtle)'
    }
  }, "#", c.id), resolved && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--status-success-fg)'
    }
  }, "\u2713 Resolved")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: active ? 'var(--primary-700)' : 'var(--neutral-800)'
    }
  }, c.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)',
      marginTop: 2,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, c.venue, " \xB7 ", c.event));
}
function PartyChips({
  c
}) {
  const items = [['Renter', c.renter], ['Host', c.host], c.provider && ['Provider', c.provider]].filter(Boolean);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8
    }
  }, items.map(([role, name]) => /*#__PURE__*/React.createElement("span", {
    key: role,
    style: {
      fontSize: 12.5,
      background: 'var(--neutral-50)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-md)',
      padding: '5px 10px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-subtle)'
    }
  }, role, ": "), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600
    }
  }, name))));
}
function CaseDetail({
  c,
  resolved,
  onResolve
}) {
  const {
    Badge,
    Button
  } = window.VenuePlusDesignSystem_17f1a7;
  const pol = policyById(c.policyId);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '22px 26px',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 700,
      padding: '3px 9px',
      borderRadius: 999,
      background: SEV[c.severity].bg,
      color: SEV[c.severity].fg,
      textTransform: 'capitalize'
    }
  }, c.severity, " severity"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: 'var(--text-subtle)'
    }
  }, c.label, " \xB7 case #", c.id), c.cat && /*#__PURE__*/React.createElement(Badge, {
    category: c.cat
  })), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 4px',
      fontSize: 22,
      fontWeight: 800
    }
  }, c.title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 14px',
      fontSize: 14.5,
      color: 'var(--neutral-600)',
      lineHeight: 1.5
    }
  }, c.reason), /*#__PURE__*/React.createElement(PartyChips, {
    c: c
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      margin: '16px 0',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "In escrow",
    value: money(c.escrow),
    accent: "var(--run-running-fg)"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Event",
    value: c.event
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Venue",
    value: c.venue
  })), /*#__PURE__*/React.createElement(Section, {
    title: "What happened"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0
    }
  }, c.timeline.map(([t, ev], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 12,
      paddingBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: '50%',
      background: 'var(--primary-400)',
      marginTop: 4
    }
  }), i < c.timeline.length - 1 && /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      width: 2,
      background: 'var(--border-default)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: -2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--text-muted)'
    }
  }, t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: 'var(--neutral-700)'
    }
  }, ev)))))), /*#__PURE__*/React.createElement(Section, {
    title: "Applicable policy"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--neutral-50)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: pol.tone
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700
    }
  }, pol.title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 600,
      color: pol.tone,
      marginLeft: 'auto'
    }
  }, pol.fault)), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 13.5,
      color: 'var(--neutral-700)',
      lineHeight: 1.5
    }
  }, pol.rule))), /*#__PURE__*/React.createElement(Section, {
    title: "Recommended resolution",
    badge: /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--primary-700)',
        background: 'var(--primary-50)',
        borderRadius: 999,
        padding: '2px 9px'
      }
    }, "\u2726 Bookings agent")
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 10px',
      fontSize: 14,
      color: 'var(--neutral-700)',
      lineHeight: 1.5
    }
  }, c.recommendation.summary), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, c.recommendation.actions.map(([label, risk, amt], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-md)',
      padding: '9px 12px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 13.5,
      color: 'var(--neutral-700)'
    }
  }, label), amt != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      fontWeight: 700
    }
  }, money(amt)), /*#__PURE__*/React.createElement(Badge, {
    risk: risk
  })))), c.recommendation.actions.some(([, r]) => r === 'money_movement' || r === 'legal') && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 0 0',
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--status-error-fg)'
    }
  }, "\u26A0 Includes hard-gated money/legal actions \u2014 your explicit approval moves the funds.")), /*#__PURE__*/React.createElement(Section, {
    title: "Alternative options"
  }, /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 7
    }
  }, c.alternatives.map(a => /*#__PURE__*/React.createElement("li", {
    key: a,
    style: {
      display: 'flex',
      gap: 9,
      fontSize: 13.5,
      color: 'var(--neutral-700)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent-500)',
      fontWeight: 700
    }
  }, "\u21B3"), a)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 20,
      paddingTop: 16,
      borderTop: '1px solid var(--border-hairline)'
    }
  }, resolved ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--status-success-fg)'
    }
  }, "\u2713 Resolved \u2014 recommended resolution applied.") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: () => onResolve(c.id, 'recommended')
  }, "Approve recommended"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    onClick: () => onResolve(c.id, 'alt')
  }, "Choose alternative"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: () => onResolve(c.id, 'deny')
  }, "Deny dispute"))));
}
function Stat({
  label,
  value,
  accent
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--text-subtle)',
      textTransform: 'uppercase',
      letterSpacing: '.03em'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: accent || 'var(--neutral-900)',
      marginTop: 2
    }
  }, value));
}
function Section({
  title,
  badge,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 9
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '.05em',
      textTransform: 'uppercase',
      color: 'var(--text-subtle)'
    }
  }, title), badge), children);
}
function Policies() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14
    }
  }, D.POLICIES.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    style: {
      background: '#fff',
      border: '1px solid var(--border-default)',
      borderTop: `3px solid ${p.tone}`,
      borderRadius: 'var(--radius-lg)',
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 16,
      fontWeight: 700
    }
  }, p.title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 600,
      color: p.tone,
      whiteSpace: 'nowrap'
    }
  }, p.fault)), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 12px',
      fontSize: 13.5,
      color: 'var(--neutral-700)',
      lineHeight: 1.5,
      fontWeight: 500
    }
  }, p.rule), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '.05em',
      textTransform: 'uppercase',
      color: 'var(--text-subtle)',
      marginBottom: 7
    }
  }, "Procedure"), /*#__PURE__*/React.createElement("ol", {
    style: {
      margin: 0,
      paddingLeft: 18,
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, p.procedure.map(s => /*#__PURE__*/React.createElement("li", {
    key: s,
    style: {
      fontSize: 13,
      color: 'var(--neutral-700)',
      lineHeight: 1.45
    }
  }, s))))));
}
function App() {
  const [tab, setTab] = useDispState('cases');
  const [sel, setSel] = useDispState(D.CASES[0].id);
  const [resolved, setResolved] = useDispState({});
  const [toast, setToast] = useDispState(null);
  const selected = D.CASES.find(c => c.id === sel);
  const resolve = (id, mode) => {
    setResolved(r => ({
      ...r,
      [id]: mode
    }));
    setToast(mode === 'deny' ? `Dispute #${id} denied.` : `Dispute #${id} resolved.`);
    setTimeout(() => setToast(null), 2400);
  };
  const openCount = D.CASES.filter(c => !resolved[c.id]).length;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      background: 'var(--surface-console)',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      background: '#fff',
      borderBottom: '1px solid var(--border-default)',
      padding: '0 24px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/venueplus-logo-mark.png",
    alt: "VenuePlus",
    style: {
      height: 34
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700
    }
  }, "Disputes & Resolutions"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      background: 'var(--neutral-100)',
      borderRadius: 999,
      padding: 3
    }
  }, [['cases', `Open cases · ${openCount}`], ['policies', 'Policies']].map(([id, label]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    onClick: () => setTab(id),
    style: {
      border: 'none',
      cursor: 'pointer',
      borderRadius: 999,
      padding: '7px 16px',
      fontSize: 13,
      fontWeight: 600,
      fontFamily: 'var(--font-sans)',
      background: tab === id ? 'var(--primary-500)' : 'transparent',
      color: tab === id ? '#fff' : 'var(--text-muted)'
    }
  }, label)))), tab === 'cases' ? /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1140,
      margin: '0 auto',
      padding: 20,
      display: 'grid',
      gridTemplateColumns: '270px 1fr',
      gap: 16,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      background: '#fff',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden'
    }
  }, D.CASES.map(c => /*#__PURE__*/React.createElement(CaseRow, {
    key: c.id,
    c: c,
    active: c.id === sel,
    resolved: !!resolved[c.id],
    onClick: () => setSel(c.id)
  }))), /*#__PURE__*/React.createElement("main", {
    style: {
      background: '#fff',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)'
    }
  }, selected && /*#__PURE__*/React.createElement(CaseDetail, {
    c: selected,
    resolved: !!resolved[selected.id],
    onResolve: resolve
  }))) : /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1140,
      margin: '0 auto',
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 16px',
      fontSize: 14,
      color: 'var(--text-muted)'
    }
  }, "The standing rules the Bookings agent applies before anything reaches your queue. Money movement always requires your approval."), /*#__PURE__*/React.createElement(Policies, null)), toast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 50,
      background: 'var(--status-success-fg)',
      color: '#fff',
      padding: '10px 18px',
      borderRadius: 'var(--radius-md)',
      fontSize: 13.5,
      fontWeight: 500,
      boxShadow: 'var(--shadow-lg)'
    }
  }, toast));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/disputes/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/disputes/data.js
try { (() => {
/* Disputes & Resolutions — cases + the policies that govern them.
   Covers host cancellation, service shortfall, provider no-show, renter no-show.
   Money-movement and legal actions stay hard-gated to the operator. */
(function () {
  const CASES = [{
    id: 1204,
    type: 'provider_noshow',
    label: 'Provider no-show',
    severity: 'high',
    title: 'Security provider did not show',
    cat: 'security',
    venue: 'The Cathedral Hall',
    renter: 'Jordan Lee',
    host: 'Marcus Reed',
    provider: 'Apex Guard LLC',
    event: 'Jun 28',
    escrow: 275.00,
    policyId: 'provider_noshow',
    reason: 'The booked security provider never arrived. Security is a required service, so the event ran out of compliance.',
    timeline: [['6:00pm', 'Event start — no security on site'], ['6:20pm', 'Renter flagged the no-show in-app'], ['6:25pm', 'Provider Network searched for a replacement (none available in time)']],
    recommendation: {
      summary: 'Refund the full $275 service line to the renter, attempt a replacement, and suspend the provider pending Trust & Safety review.',
      actions: [['Refund $275 service portion to renter', 'money_movement', 275.00], ['Dispatch replacement provider (future bookings)', 'financial', null], ['Suspend Apex Guard pending review', 'legal', null]]
    },
    alternatives: ['Waive the renter\u2019s platform fee as additional goodwill', 'Permanent removal if this is a repeat no-show']
  }, {
    id: 1188,
    type: 'host_cancellation',
    label: 'Host cancellation',
    severity: 'high',
    title: 'Host cancelled 4 hours before the event',
    venue: 'Wildflower Field',
    renter: 'Sam Ortiz',
    host: 'Dana Cole',
    event: 'Jun 20',
    escrow: 640.00,
    policyId: 'host_cancellation',
    reason: 'Host cancelled citing a scheduling conflict, 4 hours before the 6pm start — inside the 24-hour penalty window.',
    timeline: [['Jun 18', 'Booking confirmed & paid into escrow'], ['Jun 20 · 2:10pm', 'Host cancelled (within 24h)'], ['Jun 20 · 2:15pm', 'Renter notified automatically']],
    recommendation: {
      summary: 'Full refund to the renter with the platform fee waived, an automated rebooking offer, and a cancellation penalty applied to the host.',
      actions: [['Refund renter in full ($640, fee waived)', 'money_movement', 640.00], ['Offer 3 comparable nearby venues', 'outbound', null], ['Apply host cancellation penalty', 'internal_write', null]]
    },
    alternatives: ['Partial refund if the renter accepts a rescheduled date', 'Platform goodwill credit instead of a cash refund']
  }, {
    id: 1197,
    type: 'service_shortfall',
    label: 'Service shortfall',
    severity: 'medium',
    title: 'Food truck arrived 40 minutes late',
    cat: 'catering',
    venue: 'Skyline Rooftop Loft',
    renter: 'Priya N.',
    host: 'Marcus Reed',
    provider: 'Austin Eats Co.',
    event: 'Jun 24',
    escrow: 420.00,
    policyId: 'service_shortfall',
    reason: 'Renter reports the catering provider arrived 40 minutes late; guests waited. Photos and timestamps submitted.',
    timeline: [['5:00pm', 'Event start'], ['5:40pm', 'Caterer arrived (per renter evidence)'], ['Jun 25', 'Renter opened a dispute with photos']],
    recommendation: {
      summary: 'Issue a 25% service credit ($105) to the renter, deducted from the provider\u2019s payout, and log the shortfall on the provider\u2019s record.',
      actions: [['Issue $105 service credit to renter', 'money_movement', 105.00], ['Deduct credit from provider payout', 'internal_write', null], ['Log shortfall on provider rating', 'internal_write', null]]
    },
    alternatives: ['Full service refund if a second complaint exists', 'Platform absorbs the credit to protect a top-rated provider']
  }, {
    id: 1186,
    type: 'renter_noshow',
    label: 'Renter no-show',
    severity: 'low',
    title: 'Renter never arrived and did not cancel',
    venue: 'Lakeside Pool House',
    renter: 'Casey R.',
    host: 'Ivy Lang',
    event: 'Jun 16',
    escrow: 742.00,
    policyId: 'renter_noshow',
    reason: 'The renter did not show for the booked window and never cancelled. Host held the space as reserved.',
    timeline: [['Jun 16', 'Event window passed with no attendance'], ['Jun 17', 'Host confirmed the no-show']],
    recommendation: {
      summary: 'Host keeps the full payout per the cancellation policy, providers are paid for the reserved time, and no refund is issued to the renter.',
      actions: [['Release host payout ($440)', 'money_movement', 440.00], ['Pay providers for reserved time', 'money_movement', null], ['Close case — no renter refund', 'internal_write', null]]
    },
    alternatives: ['One-time 50% reschedule credit for a first offense']
  }];
  const POLICIES = [{
    id: 'host_cancellation',
    title: 'Host / listing cancellation',
    fault: 'Host at fault',
    tone: 'var(--status-error-fg)',
    rule: 'Cancellation within 24h of the event → 100% refund to the renter, platform fee waived.',
    procedure: ['Auto-refund the renter in full', 'Offer rebooking to comparable nearby venues', 'Apply a cancellation penalty to the host', 'Repeat offenders are delisted']
  }, {
    id: 'service_shortfall',
    title: 'Service below standard',
    fault: 'Provider partially at fault',
    tone: 'var(--status-pending-fg)',
    rule: 'Verified shortfall → prorated credit (25–100% of the service line) drawn from the provider payout.',
    procedure: ['Collect evidence from the reporting party', 'Apply a prorated service credit', 'Deduct from the provider payout, never the host', 'Log against provider rating; review on repeat']
  }, {
    id: 'provider_noshow',
    title: 'Provider no-show',
    fault: 'Provider at fault',
    tone: 'var(--status-error-fg)',
    rule: 'No-show on a booked service → 100% refund of that service line; replacement dispatched if feasible.',
    procedure: ['Refund the full service portion to the renter', 'Provider Network attempts a replacement', 'Suspend the provider pending Trust & Safety review', 'Required-service no-shows can trigger a venue rebooking']
  }, {
    id: 'renter_noshow',
    title: 'Renter no-show',
    fault: 'Renter at fault',
    tone: 'var(--neutral-500)',
    rule: 'No-show without cancellation → host keeps payout; providers paid for reserved time; no refund.',
    procedure: ['Confirm the no-show with the host', 'Release host & provider payouts as normal', 'No refund to the renter', 'Optional one-time reschedule credit for a first offense']
  }];
  window.DISPUTES = {
    CASES,
    POLICIES
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/disputes/data.js", error: String((e && e.message) || e) }); }

// ui_kits/finance/app.jsx
try { (() => {
/* Finance & Payouts — role-switchable dashboards (operator / host / provider)
   built around the escrow flow. */
const {
  useState: useFinState
} = React;
const F = window.FIN;
const STATUS = {
  held: {
    bg: 'var(--run-running-bg)',
    fg: 'var(--run-running-fg)',
    label: 'In escrow'
  },
  releasable: {
    bg: 'var(--run-approval-bg)',
    fg: 'var(--run-approval-fg)',
    label: 'Releasable'
  },
  disputed: {
    bg: 'var(--status-error-bg)',
    fg: 'var(--status-error-fg)',
    label: 'Disputed'
  },
  released: {
    bg: 'var(--status-success-bg)',
    fg: 'var(--status-success-fg)',
    label: 'Released'
  }
};
function Pill({
  status
}) {
  const s = STATUS[status] || STATUS.held;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 600,
      padding: '3px 9px',
      borderRadius: 999,
      background: s.bg,
      color: s.fg
    }
  }, s.label);
}
function Bars({
  data,
  labels,
  accent
}) {
  const max = Math.max(...data);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 10,
      height: 120
    }
  }, data.map((v, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--text-subtle)',
      fontWeight: 600
    }
  }, F.money(v).replace('.00', '')), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: `${v / max * 80}px`,
      background: accent,
      borderRadius: '4px 4px 0 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--text-muted)'
    }
  }, labels[i]))));
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
function Kpi({
  label,
  value,
  sub,
  accent
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--text-muted)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 23,
      fontWeight: 800,
      color: accent || 'var(--neutral-900)',
      lineHeight: 1.1,
      marginTop: 3
    }
  }, value), sub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--text-subtle)',
      marginTop: 3
    }
  }, sub));
}
function Panel({
  title,
  children,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 15,
      fontWeight: 700
    }
  }, title), right), children);
}
const th = {
  textAlign: 'left',
  padding: '8px 10px',
  fontSize: 11.5,
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '.03em'
};
const td = {
  padding: '11px 10px',
  fontSize: 13.5,
  borderTop: '1px solid var(--border-hairline)'
};

/* ---------- Escrow flow diagram ---------- */
function EscrowFlow() {
  const {
    Badge
  } = window.VenuePlusDesignSystem_17f1a7;
  const s = F.SAMPLE;
  const venue = s.venueRate * s.hours;
  const svc = s.services.map(x => ({
    ...x,
    amt: x.rate * s.hours
  }));
  const subtotal = venue + svc.reduce((a, b) => a + b.amt, 0);
  const fee = +(subtotal * s.feePct / 100).toFixed(2);
  const total = +(subtotal + fee).toFixed(2);
  const Node = ({
    children,
    tone
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      background: tone === 'dark' ? 'var(--neutral-900)' : '#fff',
      color: tone === 'dark' ? '#fff' : 'var(--neutral-900)',
      border: tone === 'dark' ? 'none' : '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: 14,
      minWidth: 0
    }
  }, children);
  const Arrow = ({
    label
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      color: 'var(--neutral-300)',
      flexShrink: 0,
      padding: '0 4px'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "9 18 15 12 9 6"
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: 'var(--text-subtle)',
      whiteSpace: 'nowrap'
    }
  }, label));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: 18,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 15,
      fontWeight: 700
    }
  }, "Escrow flow \xB7 booking #", s.id), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: 'var(--text-muted)'
    }
  }, s.venue, " \xB7 ", s.event)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.1fr auto 0.9fr auto 1.4fr',
      gap: 8,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Node, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)'
    }
  }, "Renter pays \xB7 ", s.renter), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      color: 'var(--primary-600)'
    }
  }, F.money(total)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--text-subtle)',
      marginTop: 4,
      lineHeight: 1.5
    }
  }, "Venue ", F.money(venue), /*#__PURE__*/React.createElement("br", null), svc.map(x => `${x.name.split(' ')[0]} ${F.money(x.amt)}`).join(' · '), /*#__PURE__*/React.createElement("br", null), "Fee ", F.money(fee))), /*#__PURE__*/React.createElement(Arrow, {
    label: "on booking"
  }), /*#__PURE__*/React.createElement(Node, {
    tone: "dark"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "2.5"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "5",
    y: "11",
    width: "14",
    height: "10",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 11V7a4 4 0 0 1 8 0v4"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 600
    }
  }, "Held in escrow")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      marginTop: 4
    }
  }, F.money(total)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: 'var(--neutral-400)',
      marginTop: 4
    }
  }, "Released ", s.releaseOn, ", after the event & dispute window")), /*#__PURE__*/React.createElement(Arrow, {
    label: "after event"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(SplitRow, {
    label: `Host · ${s.host}`,
    amt: venue,
    accent: "var(--primary-500)"
  }), svc.map(x => /*#__PURE__*/React.createElement(SplitRow, {
    key: x.cat,
    label: x.name,
    amt: x.amt,
    badge: /*#__PURE__*/React.createElement(Badge, {
      category: x.cat
    })
  })), /*#__PURE__*/React.createElement(SplitRow, {
    label: "Platform fee",
    amt: fee,
    accent: "var(--accent-500)",
    muted: true
  }))));
}
function SplitRow({
  label,
  amt,
  accent,
  badge,
  muted
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: muted ? 'var(--neutral-50)' : '#fff',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-md)',
      padding: '7px 10px'
    }
  }, accent && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: accent,
      flexShrink: 0
    }
  }), badge, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 12.5,
      color: 'var(--neutral-700)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      fontWeight: 700,
      color: 'var(--neutral-900)'
    }
  }, F.money(amt)));
}

/* ---------- Operator ---------- */
function Operator() {
  const {
    Button,
    Badge
  } = window.VenuePlusDesignSystem_17f1a7;
  const o = F.OPERATOR_YTD;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Kpi, {
    label: "In escrow now",
    value: F.money(o.inEscrow),
    accent: "var(--run-running-fg)"
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Releasable now",
    value: F.money(o.releasable),
    accent: "var(--run-approval-fg)",
    sub: "ready to pay out"
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Released YTD",
    value: F.money(o.releasedYtd).replace('.00', ''),
    accent: "var(--status-success-fg)"
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Platform fees YTD",
    value: F.money(o.fees).replace('.00', '')
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Open disputes",
    value: o.disputes,
    accent: o.disputes ? 'var(--status-error-fg)' : 'var(--status-success-fg)'
  })), /*#__PURE__*/React.createElement(EscrowFlow, null), /*#__PURE__*/React.createElement(Panel, {
    title: "Escrow ledger",
    right: /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12.5,
        color: 'var(--text-muted)'
      }
    }, "GMV YTD ", F.money(o.gmv).replace('.00', ''))
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Booking"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Venue"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Event"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      textAlign: 'right'
    }
  }, "Held"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      textAlign: 'right'
    }
  }, "Host"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      textAlign: 'right'
    }
  }, "Services"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      textAlign: 'right'
    }
  }, "Fee"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Status"), /*#__PURE__*/React.createElement("th", {
    style: th
  }))), /*#__PURE__*/React.createElement("tbody", null, F.LEDGER.map(b => {
    const svc = b.services.reduce((a, s) => a + s[1], 0);
    return /*#__PURE__*/React.createElement("tr", {
      key: b.id
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        fontWeight: 600,
        color: 'var(--primary-600)'
      }
    }, "#", b.id), /*#__PURE__*/React.createElement("td", {
      style: td
    }, b.venue), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        color: 'var(--text-muted)'
      }
    }, b.event), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        textAlign: 'right',
        fontWeight: 600
      }
    }, F.money(b.total)), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        textAlign: 'right'
      }
    }, F.money(b.host)), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        textAlign: 'right'
      }
    }, F.money(svc)), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        textAlign: 'right',
        color: 'var(--accent-600)'
      }
    }, F.money(b.fee)), /*#__PURE__*/React.createElement("td", {
      style: td
    }, /*#__PURE__*/React.createElement(Pill, {
      status: b.status
    })), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        textAlign: 'right'
      }
    }, b.status === 'releasable' ? /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "primary"
    }, "Release") : b.status === 'disputed' ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: 'var(--status-error-fg)'
      }
    }, "review") : ''));
  })))));
}

/* ---------- Host ---------- */
function Host() {
  const h = F.HOST,
    y = h.ytd;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Kpi, {
    label: "Earnings YTD",
    value: F.money(y.earnings).replace('.00', ''),
    accent: "var(--primary-600)"
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Bookings YTD",
    value: y.bookings
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Avg / booking",
    value: F.money(y.avg).replace('.00', '')
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Next payout",
    value: F.money(y.nextPayout).replace('.00', ''),
    sub: y.nextDate,
    accent: "var(--status-success-fg)"
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "In escrow",
    value: F.money(y.inEscrow).replace('.00', ''),
    accent: "var(--run-running-fg)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.3fr 1fr',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Earnings by month"
  }, /*#__PURE__*/React.createElement(Bars, {
    data: h.monthly,
    labels: MONTHS,
    accent: "var(--primary-500)"
  })), /*#__PURE__*/React.createElement(Panel, {
    title: "Occupancy"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: 120
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 44,
      fontWeight: 800,
      color: 'var(--primary-600)'
    }
  }, y.occupancy, "%"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)'
    }
  }, "of available hours booked")))), /*#__PURE__*/React.createElement(Panel, {
    title: `Your bookings · ${h.venue}`
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Booking"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Event"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Renter"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      textAlign: 'right'
    }
  }, "Gross"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      textAlign: 'right'
    }
  }, "Your payout"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Status"))), /*#__PURE__*/React.createElement("tbody", null, h.bookings.map(b => /*#__PURE__*/React.createElement("tr", {
    key: b.id
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      fontWeight: 600,
      color: 'var(--primary-600)'
    }
  }, "#", b.id), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      color: 'var(--text-muted)'
    }
  }, b.event), /*#__PURE__*/React.createElement("td", {
    style: td
  }, b.renter), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      textAlign: 'right'
    }
  }, F.money(b.gross)), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      textAlign: 'right',
      fontWeight: 700
    }
  }, F.money(b.payout)), /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement(Pill, {
    status: b.status
  }))))))));
}

/* ---------- Provider ---------- */
function Provider() {
  const {
    Badge
  } = window.VenuePlusDesignSystem_17f1a7;
  const pr = F.PROVIDER,
    y = pr.ytd;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Kpi, {
    label: "Earnings YTD",
    value: F.money(y.earnings).replace('.00', ''),
    accent: "var(--primary-600)"
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Jobs YTD",
    value: y.jobs
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Avg / job",
    value: F.money(y.avg).replace('.00', '')
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Next payout",
    value: F.money(y.nextPayout).replace('.00', ''),
    sub: y.nextDate,
    accent: "var(--status-success-fg)"
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Rating",
    value: `★ ${y.rating}`,
    accent: "var(--accent-600)"
  })), /*#__PURE__*/React.createElement(Panel, {
    title: "Earnings by month",
    right: /*#__PURE__*/React.createElement(Badge, {
      category: pr.cat
    })
  }, /*#__PURE__*/React.createElement(Bars, {
    data: pr.monthly,
    labels: MONTHS,
    accent: "var(--accent-500)"
  })), /*#__PURE__*/React.createElement(Panel, {
    title: "Your jobs"
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Booking"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Event"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Venue"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      textAlign: 'right'
    }
  }, "Hours"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      textAlign: 'right'
    }
  }, "Payout"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Status"))), /*#__PURE__*/React.createElement("tbody", null, pr.jobs.map(j => /*#__PURE__*/React.createElement("tr", {
    key: j.id
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      fontWeight: 600,
      color: 'var(--primary-600)'
    }
  }, "#", j.id), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      color: 'var(--text-muted)'
    }
  }, j.event), /*#__PURE__*/React.createElement("td", {
    style: td
  }, j.venue), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      textAlign: 'right'
    }
  }, j.hours, "h"), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      textAlign: 'right',
      fontWeight: 700
    }
  }, F.money(j.payout)), /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement(Pill, {
    status: j.status
  }))))))));
}
function App() {
  const [role, setRole] = useFinState('operator');
  const roles = [['operator', 'Operator', 'Avery Stone'], ['host', 'Host', 'Marcus Reed'], ['provider', 'Provider', 'Lone Star Security']];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      background: 'var(--surface-console)',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      background: '#fff',
      borderBottom: '1px solid var(--border-default)',
      padding: '0 24px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/venueplus-logo-mark.png",
    alt: "VenuePlus",
    style: {
      height: 34
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700
    }
  }, "Finance & Payouts"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      background: 'var(--neutral-100)',
      borderRadius: 999,
      padding: 3
    }
  }, roles.map(([id, label]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    onClick: () => setRole(id),
    style: {
      border: 'none',
      cursor: 'pointer',
      borderRadius: 999,
      padding: '7px 16px',
      fontSize: 13,
      fontWeight: 600,
      fontFamily: 'var(--font-sans)',
      background: role === id ? 'var(--primary-500)' : 'transparent',
      color: role === id ? '#fff' : 'var(--text-muted)'
    }
  }, label)))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 24px 6px',
      maxWidth: 1080,
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)'
    }
  }, "Viewing as"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      fontWeight: 600
    }
  }, roles.find(r => r[0] === role)[2]), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--text-subtle)'
    }
  }, "\xB7 year to date 2026")), /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: 1080,
      margin: '0 auto',
      padding: '8px 24px 64px'
    }
  }, role === 'operator' && /*#__PURE__*/React.createElement(Operator, null), role === 'host' && /*#__PURE__*/React.createElement(Host, null), role === 'provider' && /*#__PURE__*/React.createElement(Provider, null)));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/finance/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/finance/data.js
try { (() => {
/* Finance & Payouts — escrow + multi-party payout data.
   Flow: renter pays (venue + services + fee) → held in escrow → after the
   event and dispute window → released to host, providers, and platform. */
(function () {
  const money = n => '$' + n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  // The canonical escrow breakdown for one booking (used by the flow diagram).
  const SAMPLE = {
    id: 1204,
    renter: 'Jordan Lee',
    venue: 'The Cathedral Hall',
    host: 'Marcus Reed',
    event: 'Jun 28, 2026',
    hours: 5,
    releaseOn: 'Jun 29',
    venueRate: 160,
    feePct: 14,
    services: [{
      name: 'Lone Star Event Security',
      cat: 'security',
      rate: 55
    }, {
      name: 'SpotOn Cleaning Co.',
      cat: 'cleaning',
      rate: 40
    }]
  };

  // Escrow ledger — money currently in / moving through escrow.
  const LEDGER = [{
    id: 1204,
    renter: 'Jordan Lee',
    venue: 'The Cathedral Hall',
    event: 'Jun 28',
    total: 1453.50,
    host: 800,
    fee: 178.50,
    services: [['security', 275], ['cleaning', 200]],
    status: 'held'
  }, {
    id: 1201,
    renter: 'Priya N.',
    venue: 'Skyline Rooftop Loft',
    event: 'Jun 24',
    total: 996.55,
    host: 600,
    fee: 122.30,
    services: [['dj', 274.25]],
    status: 'releasable'
  }, {
    id: 1199,
    renter: 'Diego M.',
    venue: 'East Side Warehouse',
    event: 'Jun 22',
    total: 1881.00,
    host: 900,
    fee: 231.00,
    services: [['security', 330], ['catering', 420]],
    status: 'releasable'
  }, {
    id: 1188,
    renter: 'Sam Ortiz',
    venue: 'Wildflower Field',
    event: 'Jun 20',
    total: 640.00,
    host: 450,
    fee: 78.50,
    services: [['cleaning', 111.50]],
    status: 'disputed'
  }, {
    id: 1175,
    renter: 'Casey R.',
    venue: 'Lakeside Pool House',
    event: 'Jun 14',
    total: 742.00,
    host: 440,
    fee: 91.00,
    services: [['photography', 211]],
    status: 'released'
  }, {
    id: 1168,
    renter: 'Avery T.',
    venue: 'The Cathedral Hall',
    event: 'Jun 10',
    total: 1338.00,
    host: 800,
    fee: 164.00,
    services: [['security', 220], ['bartending', 154]],
    status: 'released'
  }];
  const OPERATOR_YTD = {
    gmv: 312480,
    fees: 43747,
    inEscrow: 4971.05,
    releasable: 2877.55,
    releasedYtd: 268010,
    disputes: 1,
    monthly: [38200, 44100, 49800, 52600, 61200, 66580] // Jan–Jun GMV
  };
  const HOST = {
    name: 'Marcus Reed',
    venue: 'The Cathedral Hall',
    ytd: {
      earnings: 19900,
      bookings: 24,
      avg: 829,
      nextPayout: 800,
      nextDate: 'Jun 29',
      inEscrow: 1600,
      occupancy: 71
    },
    monthly: [2400, 3100, 2800, 3600, 4200, 3800],
    bookings: [{
      id: 1204,
      event: 'Jun 28',
      renter: 'Jordan Lee',
      gross: 800,
      payout: 800,
      status: 'held'
    }, {
      id: 1168,
      event: 'Jun 10',
      renter: 'Avery T.',
      gross: 800,
      payout: 800,
      status: 'released'
    }, {
      id: 1142,
      event: 'May 31',
      renter: 'Lena P.',
      gross: 640,
      payout: 640,
      status: 'released'
    }, {
      id: 1120,
      event: 'May 18',
      renter: 'Tom B.',
      gross: 960,
      payout: 960,
      status: 'released'
    }]
  };
  const PROVIDER = {
    name: 'Lone Star Event Security',
    cat: 'security',
    ytd: {
      earnings: 14750,
      jobs: 58,
      avg: 254,
      nextPayout: 275,
      nextDate: 'Jun 29',
      inEscrow: 605,
      rating: 4.9
    },
    monthly: [1800, 2200, 2600, 2400, 3000, 2750],
    jobs: [{
      id: 1204,
      event: 'Jun 28',
      venue: 'The Cathedral Hall',
      hours: 5,
      payout: 275,
      status: 'held'
    }, {
      id: 1199,
      event: 'Jun 22',
      venue: 'East Side Warehouse',
      hours: 6,
      payout: 330,
      status: 'releasable'
    }, {
      id: 1168,
      event: 'Jun 10',
      venue: 'The Cathedral Hall',
      hours: 4,
      payout: 220,
      status: 'released'
    }, {
      id: 1131,
      event: 'May 24',
      venue: 'Skyline Rooftop Loft',
      hours: 5,
      payout: 275,
      status: 'released'
    }]
  };
  window.FIN = {
    money,
    SAMPLE,
    LEDGER,
    OPERATOR_YTD,
    HOST,
    PROVIDER
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/finance/data.js", error: String((e && e.message) || e) }); }

// ui_kits/marketplace/Detail.jsx
try { (() => {
/* Marketplace venue detail + booking panel. */
const {
  useState: useDetailState
} = React;
function VenueDetail({
  venue,
  onBack
}) {
  const {
    REQUIRED
  } = window.MP_DATA;
  const {
    Badge,
    Button,
    Checkbox
  } = window.VenuePlusDesignSystem_17f1a7;
  const [hours, setHours] = useDetailState(4);
  const [extras, setExtras] = useDetailState({
    dj: false,
    photography: false
  });
  const [booked, setBooked] = useDetailState(false);
  const reqCost = REQUIRED.reduce((s, r) => s + r.rate * hours, 0);
  const extraRates = {
    dj: 75,
    photography: 90
  };
  const extraCost = Object.entries(extras).filter(([, on]) => on).reduce((s, [k]) => s + extraRates[k] * hours, 0);
  const venueCost = venue.price * hours;
  const subtotal = venueCost + reqCost + extraCost;
  const protectionFee = +(subtotal * 0.06).toFixed(2); // VenuePlus liability protection
  const taxRate = 0.0825; // event / sales tax
  const tax = +((subtotal + protectionFee) * taxRate).toFixed(2);
  const total = +(subtotal + protectionFee + tax).toFixed(2);
  if (booked) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 520,
        margin: '64px auto',
        padding: '0 24px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: 'var(--status-success-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px',
        fontSize: 30,
        color: 'var(--status-success-fg)'
      }
    }, "\u2713"), /*#__PURE__*/React.createElement("h1", {
      style: {
        margin: '0 0 8px',
        fontSize: 26,
        fontWeight: 700
      }
    }, "Booking confirmed!"), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '0 0 24px',
        color: 'var(--text-muted)'
      }
    }, "Your booking for ", /*#__PURE__*/React.createElement("strong", null, venue.title), " is in. Booking #4827."), /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#fff',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: 24,
        textAlign: 'left',
        marginBottom: 24
      }
    }, /*#__PURE__*/React.createElement(Row, {
      label: "Status",
      value: /*#__PURE__*/React.createElement(Badge, {
        status: "awaiting_payment"
      }, "awaiting payment")
    }), /*#__PURE__*/React.createElement(Row, {
      label: "Duration",
      value: `${hours} hours`
    }), /*#__PURE__*/React.createElement(Row, {
      label: "Venue cost",
      value: `$${venueCost.toFixed(2)}`
    }), /*#__PURE__*/React.createElement(Row, {
      label: "Required services",
      value: `$${reqCost.toFixed(2)}`
    }), extraCost > 0 && /*#__PURE__*/React.createElement(Row, {
      label: "Add-on services",
      value: `$${extraCost.toFixed(2)}`
    }), /*#__PURE__*/React.createElement(Row, {
      label: "Liability protection",
      value: `$${protectionFee.toFixed(2)}`
    }), /*#__PURE__*/React.createElement(Row, {
      label: "Taxes (8.25%)",
      value: `$${tax.toFixed(2)}`
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: '1px solid var(--border-hairline)',
        marginTop: 10,
        paddingTop: 10
      }
    }, /*#__PURE__*/React.createElement(Row, {
      label: /*#__PURE__*/React.createElement("strong", null, "Total"),
      value: /*#__PURE__*/React.createElement("strong", {
        style: {
          color: 'var(--primary-600)'
        }
      }, "$", total.toFixed(2))
    }))), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: onBack
    }, "Browse more venues"));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1120,
      margin: '0 auto',
      padding: '24px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      color: 'var(--primary-600)',
      fontSize: 14,
      padding: 0,
      marginBottom: 14
    }
  }, "\u2190 Back to venues"), /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement(VenueThumb, {
    venue: venue,
    height: 340
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: 32,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Badge, {
    tone: "brand",
    style: {
      marginBottom: 10
    }
  }, venue.type), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '0 0 6px',
      fontSize: 30,
      fontWeight: 700
    }
  }, venue.title), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 15,
      marginBottom: 22
    }
  }, "\u25CC ", venue.city, ", ", venue.state), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 12,
      marginBottom: 28
    }
  }, [['Capacity', venue.capacity], ['Per hour', `$${venue.price}`], ['Minimum', '2h'], ['Rating', '4.9']].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      background: 'var(--neutral-50)',
      borderRadius: 'var(--radius-md)',
      padding: 14,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--text-muted)'
    }
  }, k), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 600,
      marginTop: 2
    }
  }, v)))), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      margin: '0 0 8px'
    }
  }, "About this space"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 24px',
      color: 'var(--neutral-600)',
      lineHeight: 1.65
    }
  }, "A standout ", venue.type, " in ", venue.city, " with room for up to ", venue.capacity, " guests. Flexible by the hour, fully insured, and pre-vetted by the VenuePlus fleet."), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      margin: '0 0 10px'
    }
  }, "\u26E8 Required services"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, REQUIRED.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.cat,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    category: r.cat
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14
    }
  }, r.name), /*#__PURE__*/React.createElement(Badge, {
    status: "cancelled",
    capitalize: false,
    style: {
      background: 'var(--status-error-bg)',
      color: 'var(--status-error-fg)'
    }
  }, "Mandatory")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: 'var(--text-muted)'
    }
  }, "$", r.rate, "/hr")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      marginTop: 14,
      background: 'var(--primary-50)',
      border: '1px solid var(--primary-100)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 14px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--primary-600)',
      fontSize: 16
    }
  }, "\u26E8"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 13.5,
      color: 'var(--neutral-700)',
      lineHeight: 1.5
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Liability protection included."), " Every booking carries VenuePlus event-liability coverage \u2014 on top of the host\u2019s own insurance policy. The fee is itemized at checkout."))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-md)',
      padding: 22,
      position: 'sticky',
      top: 88
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 700
    }
  }, "$", venue.price, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 400,
      color: 'var(--text-muted)'
    }
  }, " /hour")), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '16px 0'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--neutral-700)'
    }
  }, "Duration (hours)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setHours(h => Math.max(2, h - 1)),
    style: stepBtn
  }, "\u2212"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 17,
      fontWeight: 600,
      minWidth: 28,
      textAlign: 'center'
    }
  }, hours), /*#__PURE__*/React.createElement("button", {
    onClick: () => setHours(h => h + 1),
    style: stepBtn
  }, "+"))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--border-hairline)',
      paddingTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--neutral-700)',
      marginBottom: 8
    }
  }, "Add optional services"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    label: "DJ \u2014 $75/hr",
    checked: extras.dj,
    onChange: e => setExtras(x => ({
      ...x,
      dj: e.target.checked
    }))
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Photography \u2014 $90/hr",
    checked: extras.photography,
    onChange: e => setExtras(x => ({
      ...x,
      photography: e.target.checked
    }))
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--border-hairline)',
      margin: '14px 0',
      paddingTop: 14,
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Row, {
    sm: true,
    label: `$${venue.price} × ${hours} hrs`,
    value: `$${venueCost.toFixed(2)}`
  }), /*#__PURE__*/React.createElement(Row, {
    sm: true,
    label: "Required services",
    value: `$${reqCost.toFixed(2)}`
  }), extraCost > 0 && /*#__PURE__*/React.createElement(Row, {
    sm: true,
    label: "Add-ons",
    value: `$${extraCost.toFixed(2)}`
  }), /*#__PURE__*/React.createElement(Row, {
    sm: true,
    label: "Subtotal",
    value: `$${subtotal.toFixed(2)}`
  }), /*#__PURE__*/React.createElement(Row, {
    sm: true,
    label: "Liability protection",
    value: `$${protectionFee.toFixed(2)}`
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '1px 0 2px',
      fontSize: 11,
      color: 'var(--text-subtle)',
      lineHeight: 1.4
    }
  }, "Covers VenuePlus event liability \u2014 in addition to the host\u2019s own policy."), /*#__PURE__*/React.createElement(Row, {
    sm: true,
    label: "Taxes (8.25%)",
    value: `$${tax.toFixed(2)}`
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--border-hairline)',
      marginTop: 6,
      paddingTop: 8
    }
  }, /*#__PURE__*/React.createElement(Row, {
    label: /*#__PURE__*/React.createElement("strong", null, "Total"),
    value: /*#__PURE__*/React.createElement("strong", {
      style: {
        color: 'var(--primary-600)'
      }
    }, "$", total.toFixed(2))
  }))), /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    fullWidth: true,
    onClick: () => setBooked(true)
  }, "Book Now"))));
}
function Row({
  label,
  value,
  sm
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: sm ? '0' : '5px 0',
      fontSize: sm ? 13.5 : 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--neutral-800)'
    }
  }, value));
}
const stepBtn = {
  width: 34,
  height: 34,
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-strong)',
  background: '#fff',
  cursor: 'pointer',
  fontSize: 18,
  color: 'var(--neutral-700)'
};
Object.assign(window, {
  VenueDetail
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketplace/Detail.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketplace/Market.jsx
try { (() => {
/* Marketplace app: routes between Home, Search, and Venue Detail. */
const {
  useState: useMarketState
} = React;
function MarketApp() {
  const [route, setRoute] = useMarketState('home');
  const [venueId, setVenueId] = useMarketState(null);
  const venue = window.MP_DATA.VENUES.find(v => v.id === venueId);
  const openVenue = id => {
    setVenueId(id);
    setRoute('detail');
    window.scrollTo(0, 0);
  };
  const nav = r => {
    setRoute(r);
    window.scrollTo(0, 0);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement(Navbar, {
    onNav: nav
  }), route === 'home' && /*#__PURE__*/React.createElement(Home, {
    onNav: nav,
    onOpenVenue: openVenue
  }), route === 'search' && /*#__PURE__*/React.createElement(Search, {
    onOpenVenue: openVenue
  }), route === 'detail' && venue && /*#__PURE__*/React.createElement(VenueDetail, {
    venue: venue,
    onBack: () => nav('search')
  }), /*#__PURE__*/React.createElement(Footer, null));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(MarketApp, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketplace/Market.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketplace/Site.jsx
try { (() => {
/* Marketplace shared chrome: Navbar, Footer, VenueThumb. */
function Navbar({
  onNav,
  authed,
  onSearch
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      background: '#fff',
      boxShadow: 'var(--shadow-sm)',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1120,
      margin: '0 auto',
      padding: '0 24px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onNav('home'),
    style: {
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/venueplus-logo-mark.png",
    alt: "VenuePlus",
    style: {
      height: 38,
      width: 'auto'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22,
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--primary-500)'
    }
  }, "Venue"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent-500)'
    }
  }, "Plus"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onNav('search'),
    style: navLink
  }, "Venues"), /*#__PURE__*/React.createElement("button", {
    onClick: () => onNav('search'),
    style: navLink
  }, "Services"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: navLink
  }, "Log in"), /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--primary-500)',
      color: '#fff',
      padding: '9px 18px',
      borderRadius: 'var(--radius-md)',
      fontSize: 14,
      fontWeight: 500,
      cursor: 'pointer'
    }
  }, "Sign up"))));
}
function Footer() {
  const cols = [['For Renters', ['Browse Venues', 'Find Services', 'My Bookings']], ['For Hosts', ['List Your Space', 'Offer Services', 'Dashboard']], ['Company', ['About', 'Help Center', 'Contact']]];
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--surface-footer)',
      color: '#fff',
      padding: '48px 24px 32px',
      marginTop: 64
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1120,
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1fr 1fr',
      gap: 32
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 12px',
      fontSize: 20,
      fontWeight: 700
    }
  }, "VenuePlus"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--neutral-400)',
      fontSize: 14,
      maxWidth: '32ch'
    }
  }, "The easiest way to book unique spaces and essential services for your events.")), cols.map(([h, items]) => /*#__PURE__*/React.createElement("div", {
    key: h
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: '0 0 14px',
      fontSize: 14,
      fontWeight: 600
    }
  }, h), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, items.map(i => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      color: 'var(--neutral-400)',
      fontSize: 14
    }
  }, i)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1120,
      margin: '32px auto 0',
      paddingTop: 24,
      borderTop: '1px solid var(--neutral-800)',
      textAlign: 'center',
      color: 'var(--neutral-400)',
      fontSize: 13
    }
  }, "\xA9 2026 VenuePlus. All rights reserved."));
}
function VenueThumb({
  venue,
  height = 180
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height,
      background: `linear-gradient(135deg, ${venue.grad[0]}, ${venue.grad[1]})`,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(255,255,255,.45)',
      fontSize: 44,
      fontWeight: 700
    }
  }, "V+"), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 12,
      left: 12,
      background: 'rgba(255,255,255,.92)',
      color: 'var(--neutral-800)',
      fontSize: 11,
      fontWeight: 600,
      padding: '3px 9px',
      borderRadius: 'var(--radius-full)',
      textTransform: 'capitalize'
    }
  }, venue.type));
}
const navLink = {
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  font: 'inherit',
  fontSize: 15,
  fontWeight: 500,
  color: 'var(--neutral-700)',
  fontFamily: 'var(--font-sans)'
};
Object.assign(window, {
  Navbar,
  Footer,
  VenueThumb
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketplace/Site.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketplace/data.js
try { (() => {
/* Marketplace — simulated venue & service data for the consumer-facing kit. */
(function () {
  const VENUES = [{
    id: 1,
    title: 'Skyline Rooftop Loft',
    type: 'rooftop',
    city: 'Austin',
    state: 'TX',
    capacity: 80,
    price: 120,
    grad: ['#007db1', '#ff6946']
  }, {
    id: 2,
    title: 'East Side Warehouse',
    type: 'warehouse',
    city: 'Austin',
    state: 'TX',
    capacity: 250,
    price: 180,
    grad: ['#00648e', '#3397c1']
  }, {
    id: 3,
    title: 'Wildflower Field',
    type: 'field',
    city: 'Dripping Springs',
    state: 'TX',
    capacity: 300,
    price: 90,
    grad: ['#3397c1', '#ff876b']
  }, {
    id: 4,
    title: 'The Cathedral Hall',
    type: 'hall',
    city: 'Austin',
    state: 'TX',
    capacity: 150,
    price: 160,
    grad: ['#ff6946', '#cc5438']
  }, {
    id: 5,
    title: 'Lakeside Pool House',
    type: 'pool house',
    city: 'Lakeway',
    state: 'TX',
    capacity: 40,
    price: 110,
    grad: ['#007db1', '#66b1d0']
  }, {
    id: 6,
    title: 'Downtown Parking Deck',
    type: 'parking lot',
    city: 'Austin',
    state: 'TX',
    capacity: 200,
    price: 75,
    grad: ['#004b6a', '#007db1']
  }];
  const VENUE_TYPES = [{
    name: 'Rooftops',
    count: '150+'
  }, {
    name: 'Fields',
    count: '200+'
  }, {
    name: 'Pool Houses',
    count: '80+'
  }, {
    name: 'Parking Lots',
    count: '120+'
  }, {
    name: 'Warehouses',
    count: '90+'
  }, {
    name: 'Gardens',
    count: '110+'
  }];
  const SERVICES = [{
    name: 'Cleaning',
    cat: 'cleaning',
    desc: 'Pre & post-event cleaning crews'
  }, {
    name: 'Catering',
    cat: 'catering',
    desc: 'Food trucks & full-service catering'
  }, {
    name: 'Security',
    cat: 'security',
    desc: 'Licensed event security teams'
  }, {
    name: 'DJ Services',
    cat: 'dj',
    desc: 'Professional entertainers'
  }, {
    name: 'Bartending',
    cat: 'bartending',
    desc: 'Certified bartenders'
  }, {
    name: 'Photography',
    cat: 'photography',
    desc: 'Capture every moment'
  }];
  const REQUIRED = [{
    cat: 'security',
    name: 'Lone Star Event Security',
    rate: 55,
    mandatory: true
  }, {
    cat: 'cleaning',
    name: 'SpotOn Cleaning Co.',
    rate: 40,
    mandatory: true
  }];
  window.MP_DATA = {
    VENUES,
    VENUE_TYPES,
    SERVICES,
    REQUIRED
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketplace/data.js", error: String((e && e.message) || e) }); }

// ui_kits/marketplace/screens.jsx
try { (() => {
/* Marketplace screens: Home, Search, Venue Detail. */
const {
  useState: useMpState
} = React;
function Home({
  onNav,
  onOpenVenue
}) {
  const {
    VENUE_TYPES,
    SERVICES,
    VENUES
  } = window.MP_DATA;
  const {
    Card,
    Badge,
    Button
  } = window.VenuePlusDesignSystem_17f1a7;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--gradient-hero)',
      color: '#fff',
      padding: '72px 24px 88px',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 860,
      margin: '0 auto',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 50,
      fontWeight: 800,
      lineHeight: 1.08,
      letterSpacing: '-.02em'
    }
  }, "Find your perfect event space", /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      color: 'var(--accent-200)'
    }
  }, "+ essential services")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '20px auto 32px',
      fontSize: 20,
      color: 'var(--primary-50)',
      maxWidth: '46ch'
    }
  }, "From rooftop picnics to classic car shows. Book unique venues and everything you need \u2014 in one place."), /*#__PURE__*/React.createElement("div", {
    onClick: () => onNav('search'),
    style: {
      background: '#fff',
      borderRadius: 'var(--radius-full)',
      boxShadow: 'var(--shadow-2xl)',
      padding: 8,
      display: 'flex',
      alignItems: 'center',
      maxWidth: 560,
      margin: '0 auto',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--neutral-400)',
      padding: '0 8px 0 16px',
      fontSize: 18
    }
  }, "\u2315"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      textAlign: 'left',
      color: 'var(--neutral-400)',
      fontSize: 15
    }
  }, "Search venues by location or type\u2026"), /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--accent-500)',
      color: '#fff',
      padding: '11px 24px',
      borderRadius: 'var(--radius-full)',
      fontWeight: 500
    }
  }, "Search")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 28,
      display: 'flex',
      gap: 20,
      justifyContent: 'center',
      flexWrap: 'wrap',
      color: 'var(--primary-100)',
      fontSize: 14
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u2713 Trusted Venues"), /*#__PURE__*/React.createElement("span", null, "\u2713 Verified Services"), /*#__PURE__*/React.createElement("span", null, "\u2713 Seamless Booking")))), /*#__PURE__*/React.createElement(Section, {
    title: "Explore unique spaces",
    subtitle: "Find the perfect venue for any occasion"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: 14
    }
  }, VENUE_TYPES.map(t => /*#__PURE__*/React.createElement(Card, {
    key: t.name,
    interactive: true,
    padding: "md",
    style: {
      textAlign: 'center'
    },
    onClick: () => onNav('search')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--neutral-900)'
    }
  }, t.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)',
      marginTop: 4
    }
  }, t.count, " venues"))))), /*#__PURE__*/React.createElement(Section, {
    title: "Featured venues",
    subtitle: "Hand-picked spaces ready to book",
    bg: "var(--neutral-50)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 20
    }
  }, VENUES.slice(0, 3).map(v => /*#__PURE__*/React.createElement(VenueCard, {
    key: v.id,
    venue: v,
    onOpen: onOpenVenue
  })))), /*#__PURE__*/React.createElement(Section, {
    title: "Essential services",
    subtitle: "Book everything you need in one place"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 18
    }
  }, SERVICES.map(s => /*#__PURE__*/React.createElement(Card, {
    key: s.name,
    interactive: true,
    padding: "md",
    onClick: () => onNav('search')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 17,
      fontWeight: 600
    }
  }, s.name), /*#__PURE__*/React.createElement(Badge, {
    category: s.cat
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 0 0',
      fontSize: 14,
      color: 'var(--text-muted)'
    }
  }, s.desc))))));
}
function Search({
  onOpenVenue
}) {
  const {
    VENUES
  } = window.MP_DATA;
  const {
    Input,
    Select,
    Tabs,
    Button
  } = window.VenuePlusDesignSystem_17f1a7;
  const [type, setType] = useMpState('all');
  const types = ['all', 'rooftop', 'warehouse', 'field', 'hall', 'pool house', 'parking lot'];
  const shown = type === 'all' ? VENUES : VENUES.filter(v => v.type === type);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1120,
      margin: '0 auto',
      padding: '32px 24px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '0 0 6px',
      fontSize: 32,
      fontWeight: 700
    }
  }, "Find a venue"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 22px',
      fontSize: 17,
      color: 'var(--text-muted)'
    }
  }, shown.length, " spaces in Austin, TX"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      marginBottom: 18,
      flexWrap: 'wrap',
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 220
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Search",
    placeholder: "Rooftop, warehouse\u2026"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 160
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Max $/hr",
    type: "number",
    placeholder: "200"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 160
    }
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Sort",
    options: [{
      value: 'rel',
      label: 'Relevance'
    }, {
      value: 'price',
      label: 'Price ↑'
    }, {
      value: 'cap',
      label: 'Capacity'
    }]
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "primary"
  }, "Search")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    value: type,
    onChange: setType,
    items: types.map(t => ({
      value: t,
      label: t === 'all' ? 'All' : t,
      capitalize: true
    }))
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 20
    }
  }, shown.map(v => /*#__PURE__*/React.createElement(VenueCard, {
    key: v.id,
    venue: v,
    onOpen: onOpenVenue
  }))));
}
function VenueCard({
  venue,
  onOpen
}) {
  const {
    Card
  } = window.VenuePlusDesignSystem_17f1a7;
  return /*#__PURE__*/React.createElement(Card, {
    interactive: true,
    padding: "none",
    onClick: () => onOpen(venue.id)
  }, /*#__PURE__*/React.createElement(VenueThumb, {
    venue: venue
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 17,
      fontWeight: 600,
      color: 'var(--neutral-900)'
    }
  }, venue.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: 'var(--text-muted)',
      marginTop: 3
    }
  }, "\u25CC ", venue.city, ", ", venue.state), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTop: '1px solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      color: 'var(--neutral-600)'
    }
  }, "Up to ", venue.capacity), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: 'var(--primary-600)'
    }
  }, "$", venue.price, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-subtle)',
      fontWeight: 400,
      fontSize: 13
    }
  }, "/hr")))));
}
function Section({
  title,
  subtitle,
  children,
  bg = '#fff'
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: bg,
      padding: '56px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1120,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 30,
      fontWeight: 700,
      textAlign: 'center'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 0 32px',
      fontSize: 17,
      color: 'var(--text-muted)',
      textAlign: 'center'
    }
  }, subtitle), children));
}
Object.assign(window, {
  Home,
  Search,
  VenueCard,
  Section
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketplace/screens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mission-control/Agents.jsx
try { (() => {
/* Agents: dispatch a goal in plain English; watch the fleet work. */
const {
  useState: useStateAgents
} = React;
function Agents({
  agents,
  fleetEnabled,
  onDispatch
}) {
  const {
    Button,
    Card,
    Badge
  } = window.VenuePlusDesignSystem_17f1a7;
  const [goal, setGoal] = useStateAgents('');
  const [city, setCity] = useStateAgents('');
  const [result, setResult] = useStateAgents(null);
  const examples = ['Grow venue supply with cold email in Austin, TX', 'Publish 5 SEO landing pages for Nashville rooftops', 'Re-engage providers with no jobs in 30 days'];
  const dispatch = () => {
    if (!goal.trim() || !fleetEnabled) return;
    const r = onDispatch(goal.trim(), city.trim());
    setResult(r);
    setGoal('');
    setCity('');
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "md",
    style: {
      border: '1px solid var(--border-default)',
      boxShadow: 'none'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 4px',
      fontSize: 16,
      fontWeight: 700
    }
  }, "Run a goal"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 12px',
      fontSize: 13.5,
      color: 'var(--text-muted)'
    }
  }, "Describe an outcome. The planner fans it out across the fleet \u2014 high-risk actions land in your approval queue."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: goal,
    onChange: e => setGoal(e.target.value),
    placeholder: "e.g. Grow venue supply with paid ads in Austin",
    style: inputStyle
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: city,
    onChange: e => setCity(e.target.value),
    placeholder: "City (optional)",
    style: {
      ...inputStyle,
      maxWidth: 240
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    disabled: !goal.trim() || !fleetEnabled,
    onClick: dispatch
  }, fleetEnabled ? 'Run goal' : 'Fleet disabled')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, examples.map(ex => /*#__PURE__*/React.createElement("button", {
    key: ex,
    onClick: () => setGoal(ex),
    style: chipStyle
  }, ex)))), result && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      background: 'var(--status-success-bg)',
      border: '1px solid #bbf7d0',
      borderRadius: 'var(--radius-md)',
      padding: '10px 12px',
      fontSize: 13.5,
      color: 'var(--status-success-fg)'
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Run #", result.id, " dispatched"), " \xB7 ", result.escalations, " escalation", result.escalations === 1 ? '' : 's', " opened.", /*#__PURE__*/React.createElement("br", null), result.executed, "/", result.total, " actions auto-executed across ", result.jobs, " agents.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      margin: '0 0 14px'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 16,
      fontWeight: 700
    }
  }, "Fleet"), /*#__PURE__*/React.createElement(Badge, {
    tone: fleetEnabled ? 'success' : 'error',
    capitalize: false
  }, agents.length, " agents \xB7 ", fleetEnabled ? 'live' : 'halted')), (window.MC_DATA.FACETS || []).map(f => {
    const rows = agents.filter(a => a.facet === f.id);
    if (!rows.length) return null;
    return /*#__PURE__*/React.createElement("div", {
      key: f.id,
      style: {
        marginBottom: 18
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '.05em',
        textTransform: 'uppercase',
        color: 'var(--text-subtle)',
        marginBottom: 8
      }
    }, f.name), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12
      }
    }, rows.map(a => /*#__PURE__*/React.createElement(Card, {
      key: a.agent,
      padding: "md",
      style: {
        border: '1px solid var(--border-default)',
        boxShadow: 'none'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      style: {
        margin: 0,
        fontSize: 15,
        fontWeight: 700,
        textTransform: 'capitalize'
      }
    }, a.agent), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '3px 0 0',
        fontSize: 13,
        color: 'var(--text-muted)',
        maxWidth: '38ch'
      }
    }, a.role)), a.needs_approval > 0 && /*#__PURE__*/React.createElement(Badge, {
      status: "needs_approval"
    }, a.needs_approval, " pending")), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '10px 0 0',
        fontSize: 11.5,
        color: 'var(--text-subtle)'
      }
    }, "Last run: ", a.last_run), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 16,
        marginTop: 8,
        fontSize: 13,
        fontWeight: 500
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--status-success-fg)'
      }
    }, a.done, " done"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--status-pending-fg)'
      }
    }, a.needs_approval, " need approval"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: a.blocked ? 'var(--status-error-fg)' : 'var(--text-subtle)'
      }
    }, a.blocked, " blocked"))))));
  })));
}
const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px 14px',
  fontSize: 14,
  fontFamily: 'var(--font-sans)',
  color: 'var(--neutral-900)',
  background: '#fff',
  border: '1px solid var(--neutral-300)',
  borderRadius: 'var(--radius-md)',
  outline: 'none'
};
const chipStyle = {
  border: '1px solid var(--border-default)',
  background: 'var(--neutral-50)',
  cursor: 'pointer',
  borderRadius: 'var(--radius-full)',
  padding: '5px 12px',
  fontSize: 12,
  color: 'var(--neutral-600)',
  fontFamily: 'var(--font-sans)'
};
Object.assign(window, {
  Agents
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mission-control/Agents.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mission-control/Console.jsx
try { (() => {
/* Mission Control — interactive app shell wiring the screens together. */
const {
  useState: useAppState
} = React;
function App() {
  const seed = window.MC_DATA;
  const [tab, setTab] = useAppState('overview');
  const [fleetEnabled, setFleetEnabled] = useAppState(true);
  const [escalations, setEscalations] = useAppState(seed.ESCALATIONS);
  const [runs, setRuns] = useAppState(seed.RUNS);
  const [openRunId, setOpenRunId] = useAppState(null);
  const [toast, setToast] = useAppState(null);
  const operator = {
    name: 'Avery Stone'
  };
  const flash = (msg, ok = true) => {
    setToast({
      msg,
      ok
    });
    setTimeout(() => setToast(null), 2600);
  };
  const toggleFleet = () => {
    setFleetEnabled(v => {
      flash(`Fleet ${v ? 'disabled — new runs halted' : 'enabled'}.`, !v ? true : false);
      return !v;
    });
  };
  const resolve = (id, approve) => {
    setEscalations(list => list.filter(e => e.id !== id));
    flash(`${approve ? 'Approved' : 'Rejected'} escalation #${id}.`, approve);
  };
  const dispatchGoal = (goal, city) => {
    const id = 312 + runs.length;
    const newRun = {
      id,
      goal: city ? `${goal} (${city})` : goal,
      status: 'needs_approval',
      executed: 5,
      total: 6,
      pending: 1,
      when: 'just now',
      jobs: [{
        agent: 'discovery',
        status: 'done',
        blockers: [],
        actions: [{
          tool: 'search_places',
          risk: 'read',
          decision: 'auto',
          executed: true,
          reason: 'Found new candidate leads.'
        }, {
          tool: 'send_outreach_email',
          risk: 'outbound',
          decision: 'require_approval',
          executed: false,
          reason: 'Top draft held for operator review.'
        }]
      }]
    };
    setRuns(r => [newRun, ...r]);
    setEscalations(list => [{
      id: 100 + id,
      tool: 'send_outreach_email',
      risk: 'outbound',
      agent: 'discovery',
      run_id: id,
      run_goal: newRun.goal,
      reason: 'New cold outreach draft awaiting your approval.',
      created_at: 'just now',
      args: {
        template: 'venue_cold_v3'
      }
    }, ...list]);
    flash(`Run #${id} dispatched.`);
    return {
      id,
      escalations: 1,
      executed: 5,
      total: 6,
      jobs: 1
    };
  };
  const openRun = rid => {
    setOpenRunId(rid);
    setTab('runs');
  };
  const tabs = [{
    id: 'overview',
    label: 'Overview'
  }, {
    id: 'agents',
    label: 'Agents'
  }, {
    id: 'runs',
    label: 'Runs'
  }, {
    id: 'escalations',
    label: 'Escalations'
  }, {
    id: 'settings',
    label: 'Settings'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      background: 'var(--surface-console)'
    }
  }, /*#__PURE__*/React.createElement(ConsoleHeader, {
    operator: operator
  }), /*#__PURE__*/React.createElement(Nav, {
    tabs: tabs,
    active: tab,
    onChange: t => {
      setTab(t);
      if (t !== 'runs') setOpenRunId(null);
    },
    badges: {
      escalations: escalations.length
    }
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: 1100,
      margin: '0 auto',
      padding: '24px 24px 64px'
    }
  }, tab === 'overview' && /*#__PURE__*/React.createElement(Overview, {
    metrics: seed.METRICS,
    openEsc: escalations.length,
    fleetEnabled: fleetEnabled,
    onToggleFleet: toggleFleet,
    onGoEscalations: () => setTab('escalations')
  }), tab === 'agents' && /*#__PURE__*/React.createElement(Agents, {
    agents: seed.AGENTS,
    fleetEnabled: fleetEnabled,
    onDispatch: dispatchGoal
  }), tab === 'runs' && /*#__PURE__*/React.createElement(Runs, {
    runs: runs,
    openRunId: openRunId,
    onOpenRun: setOpenRunId,
    onBack: () => setOpenRunId(null)
  }), tab === 'escalations' && /*#__PURE__*/React.createElement(Escalations, {
    escalations: escalations,
    onResolve: resolve,
    onOpenRun: openRun
  }), tab === 'settings' && /*#__PURE__*/React.createElement(Settings, {
    onFlash: flash
  })), toast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 50,
      background: toast.ok ? 'var(--status-success-fg)' : 'var(--status-error-fg)',
      color: '#fff',
      padding: '10px 18px',
      borderRadius: 'var(--radius-md)',
      fontSize: 13.5,
      fontWeight: 500,
      boxShadow: 'var(--shadow-lg)',
      fontFamily: 'var(--font-sans)'
    }
  }, toast.msg));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mission-control/Console.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mission-control/Escalations.jsx
try { (() => {
/* Escalations: the human-in-the-loop approval queue — the operator's core job. */
const HARD_GATED = new Set(['money_movement', 'legal']);
function CheckList({
  items
}) {
  return /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, items.map(([label, ok]) => /*#__PURE__*/React.createElement("li", {
    key: label,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 13,
      color: 'var(--neutral-700)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 17,
      height: 17,
      borderRadius: '50%',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 11,
      fontWeight: 700,
      background: ok ? 'var(--status-success-bg)' : 'var(--status-pending-bg)',
      color: ok ? 'var(--status-success-fg)' : 'var(--status-pending-fg)'
    }
  }, ok ? '✓' : '!'), label)));
}
function ListingReview({
  p
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '220px 1fr',
      gap: 18,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: '1px solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 110,
      background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(255,255,255,.5)',
      fontSize: 30,
      fontWeight: 700
    }
  }, "V+"), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 8,
      left: 8,
      background: 'rgba(255,255,255,.92)',
      color: 'var(--neutral-800)',
      fontSize: 10.5,
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: 999,
      textTransform: 'capitalize'
    }
  }, p.type), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      bottom: 8,
      right: 8,
      background: 'rgba(0,0,0,.5)',
      color: '#fff',
      fontSize: 10.5,
      fontWeight: 600,
      padding: '2px 7px',
      borderRadius: 999
    }
  }, p.photos, " photos")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 12,
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      fontWeight: 700
    }
  }, p.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, "\u25CC ", p.city, ", ", p.state), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
      paddingTop: 10,
      borderTop: '1px solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: 'var(--neutral-600)'
    }
  }, "Up to ", p.capacity), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: 'var(--primary-600)',
      fontSize: 14
    }
  }, "$", p.price, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 400,
      color: 'var(--text-subtle)',
      fontSize: 11.5
    }
  }, "/hr"))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '4px 16px',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Detail, {
    k: "Host",
    v: p.host
  }), /*#__PURE__*/React.createElement(Detail, {
    k: "Completeness",
    v: `${p.completeness}%`
  }), /*#__PURE__*/React.createElement(Detail, {
    k: "Rate vs comp",
    v: `$${p.price} (sugg. $${p.suggested_price})`
  }), /*#__PURE__*/React.createElement(Detail, {
    k: "Required",
    v: p.required.join(', '),
    cap: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontWeight: 700,
      letterSpacing: '.04em',
      textTransform: 'uppercase',
      color: 'var(--text-subtle)',
      margin: '6px 0 7px'
    }
  }, "Onboarding agent checks"), /*#__PURE__*/React.createElement(CheckList, {
    items: p.checks
  })));
}
function ProviderReview({
  p
}) {
  const {
    Badge
  } = window.VenuePlusDesignSystem_17f1a7;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '220px 1fr',
      gap: 18,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-hairline)',
      padding: 14,
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 'var(--radius-md)',
      background: 'var(--gradient-brand)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontWeight: 700
    }
  }, p.name[0]), /*#__PURE__*/React.createElement(Badge, {
    category: p.category
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      fontWeight: 700
    }
  }, p.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, "\u25CC ", p.area, " \xB7 ", p.radius, " mi"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
      paddingTop: 10,
      borderTop: '1px solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: 'var(--status-success-fg)'
    }
  }, "\u26E8 Insured"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: 'var(--primary-600)',
      fontSize: 14
    }
  }, "$", p.rate, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 400,
      color: 'var(--text-subtle)',
      fontSize: 11.5
    }
  }, "/hr")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '4px 16px',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Detail, {
    k: "Team size",
    v: `${p.team} people`
  }), /*#__PURE__*/React.createElement(Detail, {
    k: "License #",
    v: p.license
  }), /*#__PURE__*/React.createElement(Detail, {
    k: "Insurance",
    v: `Valid · ${p.insurance_expires}`
  }), /*#__PURE__*/React.createElement(Detail, {
    k: "Hourly rate",
    v: `$${p.rate}`
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontWeight: 700,
      letterSpacing: '.04em',
      textTransform: 'uppercase',
      color: 'var(--text-subtle)',
      margin: '6px 0 7px'
    }
  }, "Trust & Safety checks"), /*#__PURE__*/React.createElement(CheckList, {
    items: p.checks
  })));
}
function Detail({
  k,
  v,
  cap
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      padding: '3px 0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, k, ": "), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--neutral-800)',
      fontWeight: 600,
      textTransform: cap ? 'capitalize' : 'none'
    }
  }, v));
}
function Escalations({
  escalations,
  onResolve,
  onOpenRun
}) {
  const {
    Badge
  } = window.VenuePlusDesignSystem_17f1a7;
  if (escalations.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#fff',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: 48,
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 15
      }
    }, "\uD83C\uDF89 No open escalations. The fleet is clear \u2014 go do something else.");
  }
  const titleFor = e => e.kind === 'listing_review' ? 'New listing ready to go live' : e.kind === 'provider_review' ? 'New provider ready to verify' : null;
  const approveLabel = e => e.kind === 'listing_review' ? 'Approve & publish' : e.kind === 'provider_review' ? 'Verify & approve' : 'Approve';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 18,
      fontWeight: 700
    }
  }, "Approval queue"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, escalations.map(e => {
    const gated = HARD_GATED.has(e.risk);
    const review = e.kind === 'listing_review' || e.kind === 'provider_review';
    return /*#__PURE__*/React.createElement("div", {
      key: e.id,
      style: {
        background: '#fff',
        border: `1px solid ${gated ? '#fecaca' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: 14,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0,
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap'
      }
    }, review ? /*#__PURE__*/React.createElement("strong", {
      style: {
        fontSize: 15,
        color: 'var(--neutral-900)'
      }
    }, titleFor(e)) : /*#__PURE__*/React.createElement("code", {
      style: {
        fontSize: 13,
        fontFamily: 'ui-monospace, monospace',
        color: 'var(--neutral-800)'
      }
    }, e.tool), /*#__PURE__*/React.createElement(Badge, {
      risk: e.risk
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: 'var(--text-subtle)',
        textTransform: 'capitalize'
      }
    }, e.agent)), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '8px 0 0',
        fontSize: 14,
        color: 'var(--neutral-700)'
      }
    }, e.reason), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '6px 0 0',
        fontSize: 12,
        color: 'var(--text-subtle)'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => onOpenRun(e.run_id),
      style: linkBtn
    }, "run #", e.run_id), e.run_goal ? ` · ${e.run_goal}` : '', " \xB7 ", e.created_at), e.kind === 'listing_review' && /*#__PURE__*/React.createElement(ListingReview, {
      p: e.payload
    }), e.kind === 'provider_review' && /*#__PURE__*/React.createElement(ProviderReview, {
      p: e.payload
    }), !review && e.args && /*#__PURE__*/React.createElement("pre", {
      style: {
        margin: '10px 0 0',
        background: 'var(--neutral-50)',
        border: '1px solid var(--border-hairline)',
        borderRadius: 'var(--radius-sm)',
        padding: 10,
        fontSize: 11.5,
        overflowX: 'auto',
        color: 'var(--neutral-700)'
      }
    }, JSON.stringify(e.args, null, 2)), gated && /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '8px 0 0',
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--status-error-fg)'
      }
    }, "\u26A0 Hard-gated ", e.risk.replace('_', ' '), " action \u2014 requires explicit confirmation.")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => onResolve(e.id, true),
      style: approveBtn
    }, approveLabel(e)), /*#__PURE__*/React.createElement("button", {
      onClick: () => onResolve(e.id, false),
      style: rejectBtn
    }, "Reject"))));
  })));
}
const linkBtn = {
  border: 'none',
  background: 'none',
  padding: 0,
  cursor: 'pointer',
  color: 'var(--primary-600)',
  font: 'inherit',
  textDecoration: 'underline'
};
const approveBtn = {
  border: 'none',
  cursor: 'pointer',
  borderRadius: 'var(--radius-md)',
  padding: '9px 18px',
  fontSize: 13.5,
  fontWeight: 600,
  color: '#fff',
  background: 'var(--status-success-fg)',
  fontFamily: 'var(--font-sans)'
};
const rejectBtn = {
  cursor: 'pointer',
  borderRadius: 'var(--radius-md)',
  padding: '9px 18px',
  fontSize: 13.5,
  fontWeight: 600,
  color: 'var(--status-error-fg)',
  background: '#fff',
  border: '1px solid #fecaca',
  fontFamily: 'var(--font-sans)'
};
Object.assign(window, {
  Escalations
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mission-control/Escalations.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mission-control/Overview.jsx
try { (() => {
/* Overview: the operator's at-a-glance command screen. */
function Overview({
  metrics,
  openEsc,
  fleetEnabled,
  onToggleFleet,
  onGoEscalations
}) {
  const {
    KpiCard,
    Button,
    Card
  } = window.VenuePlusDesignSystem_17f1a7;
  const money = n => '$' + n.toLocaleString('en-US');
  const Summary = ({
    title,
    rows
  }) => /*#__PURE__*/React.createElement(Card, {
    padding: "md",
    style: {
      border: '1px solid var(--border-default)',
      boxShadow: 'none'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 10px',
      fontSize: 15,
      fontWeight: 700,
      color: 'var(--neutral-900)'
    }
  }, title), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, rows.map((r, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      fontSize: 13.5,
      color: r.alarm ? 'var(--status-error-fg)' : 'var(--neutral-700)'
    }
  }, r.text))));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, openEsc > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: onGoEscalations,
    style: {
      textAlign: 'left',
      cursor: 'pointer',
      border: '1px solid var(--alert-border)',
      background: 'var(--alert-bg)',
      color: 'var(--alert-fg)',
      borderRadius: 'var(--radius-lg)',
      padding: '14px 18px',
      fontFamily: 'var(--font-sans)',
      fontSize: 14
    }
  }, /*#__PURE__*/React.createElement("strong", null, openEsc), " escalation", openEsc === 1 ? '' : 's', " awaiting your approval\xA0\u2192"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(KpiCard, {
    label: "Active venues",
    value: metrics.active_venues
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Active providers",
    value: metrics.active_providers
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Bookings (30d)",
    value: metrics.bookings_30d,
    delta: "+12% vs prior 30d",
    deltaTone: "up"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "GMV (captured)",
    value: money(metrics.gmv),
    delta: "+9% vs prior 30d",
    deltaTone: "up"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Platform fees",
    value: money(metrics.fees)
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Total bookings",
    value: metrics.total_bookings.toLocaleString()
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Open escalations",
    value: openEsc,
    accent: openEsc > 0 ? 'var(--status-pending-fg)' : 'var(--status-success-fg)'
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Fleet status",
    value: fleetEnabled ? 'ENABLED' : 'DISABLED',
    accent: fleetEnabled ? 'var(--status-success-fg)' : 'var(--status-error-fg)'
  })), /*#__PURE__*/React.createElement(Card, {
    padding: "md",
    style: {
      border: '1px solid var(--border-default)',
      boxShadow: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 16,
      fontWeight: 700,
      color: 'var(--neutral-900)'
    }
  }, "Fleet kill switch"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontSize: 13.5,
      color: 'var(--text-muted)'
    }
  }, fleetEnabled ? 'Agents can plan and run goals autonomously. Disable to halt all new runs instantly.' : 'Agents are halted. New runs are rejected until you re-enable the fleet.')), /*#__PURE__*/React.createElement("button", {
    onClick: onToggleFleet,
    style: {
      border: 'none',
      cursor: 'pointer',
      borderRadius: 'var(--radius-md)',
      padding: '10px 20px',
      fontFamily: 'var(--font-sans)',
      fontSize: 14,
      fontWeight: 600,
      color: '#fff',
      background: fleetEnabled ? 'var(--status-error-fg)' : 'var(--status-success-fg)'
    }
  }, fleetEnabled ? 'Disable fleet' : 'Enable fleet')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Summary, {
    title: "Supply",
    rows: [{
      text: `${metrics.active_venues} active venues`
    }, {
      text: `${metrics.active_providers} active providers`
    }, {
      text: `${metrics.categories} service categories covered`
    }, {
      text: `${metrics.cities} launch cities`
    }]
  }), /*#__PURE__*/React.createElement(Summary, {
    title: "Demand",
    rows: [{
      text: `${metrics.total_bookings.toLocaleString()} total bookings`
    }, {
      text: `${metrics.bookings_30d} in the last 30 days`
    }, {
      text: `${money(metrics.gmv)} GMV`
    }, {
      text: `${money(metrics.fees)} platform fees`
    }]
  }), /*#__PURE__*/React.createElement(Summary, {
    title: "Liquidity",
    rows: [{
      text: `${metrics.fully_serviced_pct}% bookings fully serviced`
    }, {
      text: `${metrics.unserviceable} unserviceable bookings`,
      alarm: metrics.unserviceable > 0
    }, {
      text: `${metrics.bookings_per_venue} bookings / active venue`
    }, {
      text: `Agents cleared ${metrics.active_venues + metrics.active_providers} listings to date`
    }]
  })));
}
Object.assign(window, {
  Overview
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mission-control/Overview.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mission-control/Runs.jsx
try { (() => {
/* Runs: a list of agent runs; click one for the full audit trace (jobs → actions). */
function Runs({
  runs,
  openRunId,
  onOpenRun,
  onBack
}) {
  const {
    Badge
  } = window.VenuePlusDesignSystem_17f1a7;
  if (openRunId != null) {
    const run = runs.find(r => r.id === openRunId);
    if (run) return /*#__PURE__*/React.createElement(RunDetail, {
      run: run,
      onBack: onBack
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 18,
      fontWeight: 700
    }
  }, "Agent runs"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      textAlign: 'left',
      color: 'var(--text-muted)',
      borderBottom: '1px solid var(--border-default)'
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Run"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Goal"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Status"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      textAlign: 'center'
    }
  }, "Actions"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      textAlign: 'center'
    }
  }, "Pending"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "When"))), /*#__PURE__*/React.createElement("tbody", null, runs.map(r => /*#__PURE__*/React.createElement("tr", {
    key: r.id,
    onClick: () => onOpenRun(r.id),
    style: {
      borderBottom: '1px solid var(--border-hairline)',
      cursor: 'pointer'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--neutral-50)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      color: 'var(--primary-600)',
      fontWeight: 600
    }
  }, "#", r.id), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      maxWidth: 360,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, r.goal), /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement(Badge, {
    status: r.status
  })), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      textAlign: 'center'
    }
  }, r.executed, "/", r.total), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      textAlign: 'center'
    }
  }, r.pending > 0 ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--status-pending-fg)',
      fontWeight: 600
    }
  }, r.pending) : /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-subtle)'
    }
  }, "0")), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      color: 'var(--text-muted)'
    }
  }, r.when)))))));
}
function RunDetail({
  run,
  onBack
}) {
  const {
    Badge
  } = window.VenuePlusDesignSystem_17f1a7;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: linkBtn
  }, "\u2190 All runs"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 18,
      fontWeight: 700
    }
  }, "Run #", run.id), /*#__PURE__*/React.createElement(Badge, {
    status: run.status
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      fontSize: 14,
      color: 'var(--neutral-700)'
    }
  }, run.goal), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      fontSize: 13,
      color: 'var(--text-muted)'
    }
  }, run.executed, "/", run.total, " actions executed \xB7 ", run.pending, " awaiting approval \xB7 ", run.when)), run.jobs.map(job => /*#__PURE__*/React.createElement("div", {
    key: job.agent,
    style: {
      background: '#fff',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '11px 16px',
      borderBottom: '1px solid var(--border-default)',
      background: 'var(--neutral-50)'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 14.5,
      fontWeight: 700,
      textTransform: 'capitalize'
    }
  }, job.agent), /*#__PURE__*/React.createElement(Badge, {
    status: job.status
  })), /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      textAlign: 'left',
      color: 'var(--text-muted)',
      borderBottom: '1px solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Tool"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Risk"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Decision"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      textAlign: 'center'
    }
  }, "Run"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Reason"))), /*#__PURE__*/React.createElement("tbody", null, job.actions.map((a, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    style: {
      borderBottom: '1px solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      fontFamily: 'ui-monospace, monospace',
      fontSize: 12
    }
  }, a.tool), /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement(Badge, {
    risk: a.risk
  })), /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement(Badge, {
    decision: a.decision
  })), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      textAlign: 'center'
    }
  }, a.executed ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--status-success-fg)'
    }
  }, "\u2713") : /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-subtle)'
    }
  }, "\u2014")), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      color: 'var(--neutral-600)'
    }
  }, a.reason))))))));
}
const th = {
  padding: '10px 14px',
  fontWeight: 600
};
const td = {
  padding: '11px 14px',
  verticalAlign: 'top'
};
Object.assign(window, {
  Runs
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mission-control/Runs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mission-control/Settings.jsx
try { (() => {
/* Settings — per-agent autonomy controls. Operator decides, per action,
   what runs automatically vs. lands in the approval queue. Money & legal
   actions are permanently hard-gated. Persists to localStorage. */
const {
  useState: useSetState,
  useEffect: useSetEffect
} = React;
const STORE_KEY = 'vp_agent_settings_v1';
const POL_COLOR = {
  auto: {
    bg: 'var(--decision-auto-bg)',
    fg: 'var(--decision-auto-fg)',
    label: 'Auto'
  },
  approval: {
    bg: 'var(--decision-approval-bg)',
    fg: 'var(--decision-approval-fg)',
    label: 'Approval'
  },
  off: {
    bg: 'var(--neutral-200)',
    fg: 'var(--neutral-600)',
    label: 'Off'
  }
};

// preset → policy by risk tier
const PRESETS = {
  conservative: {
    read: 'auto',
    internal_write: 'approval',
    outbound: 'approval',
    financial: 'approval'
  },
  balanced: {
    read: 'auto',
    internal_write: 'auto',
    outbound: 'approval',
    financial: 'approval'
  },
  maxauto: {
    read: 'auto',
    internal_write: 'auto',
    outbound: 'auto',
    financial: 'auto'
  }
};
function defaultState() {
  const POL = window.MC_DATA.POLICIES;
  const s = {};
  Object.keys(POL).forEach(id => {
    s[id] = {
      gates: {},
      thresholds: {}
    };
    POL[id].gates.forEach(g => {
      s[id].gates[g.id] = g.policy;
    });
    POL[id].thresholds.forEach(t => {
      s[id].thresholds[t.id] = t.value;
    });
  });
  return s;
}
function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return defaultState();
    const saved = JSON.parse(raw);
    const base = defaultState();
    Object.keys(base).forEach(id => {
      if (saved[id]) {
        Object.assign(base[id].gates, saved[id].gates || {});
        Object.assign(base[id].thresholds, saved[id].thresholds || {});
      }
    });
    return base;
  } catch (e) {
    return defaultState();
  }
}
function Seg({
  value,
  locked,
  onChange
}) {
  if (locked) {
    return /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 12,
        fontWeight: 600,
        padding: '5px 12px',
        borderRadius: 'var(--radius-full)',
        background: 'var(--risk-money-bg)',
        color: 'var(--risk-money-fg)',
        whiteSpace: 'nowrap'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "12",
      height: "12",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "5",
      y: "11",
      width: "14",
      height: "10",
      rx: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M8 11V7a4 4 0 0 1 8 0v4"
    })), "Approval \xB7 locked");
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      background: 'var(--neutral-100)',
      borderRadius: 'var(--radius-full)',
      padding: 2
    }
  }, ['auto', 'approval', 'off'].map(p => {
    const on = value === p;
    const c = POL_COLOR[p];
    return /*#__PURE__*/React.createElement("button", {
      key: p,
      onClick: () => onChange(p),
      style: {
        border: 'none',
        cursor: 'pointer',
        borderRadius: 'var(--radius-full)',
        padding: '5px 12px',
        fontSize: 12,
        fontWeight: 600,
        fontFamily: 'var(--font-sans)',
        background: on ? c.bg : 'transparent',
        color: on ? c.fg : 'var(--text-muted)'
      }
    }, c.label);
  }));
}
function Settings({
  onFlash
}) {
  const {
    Badge,
    Card
  } = window.VenuePlusDesignSystem_17f1a7;
  const POL = window.MC_DATA.POLICIES;
  const FACETS = window.MC_DATA.FACETS;
  const AGENTS = window.MC_DATA.AGENTS;
  const [state, setState] = useSetState(loadState);
  useSetEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) {}
  }, [state]);
  const setGate = (aid, gid, policy) => {
    setState(s => ({
      ...s,
      [aid]: {
        ...s[aid],
        gates: {
          ...s[aid].gates,
          [gid]: policy
        }
      }
    }));
  };
  const setThreshold = (aid, tid, value) => {
    setState(s => ({
      ...s,
      [aid]: {
        ...s[aid],
        thresholds: {
          ...s[aid].thresholds,
          [tid]: value
        }
      }
    }));
  };
  const applyPreset = preset => {
    const map = PRESETS[preset];
    setState(s => {
      const next = {
        ...s
      };
      Object.keys(POL).forEach(aid => {
        const gates = {
          ...next[aid].gates
        };
        POL[aid].gates.forEach(g => {
          if (g.locked) return;
          if (g.id === 'faq_auto') {
            gates[g.id] = preset === 'maxauto' ? 'auto' : 'off';
            return;
          }
          gates[g.id] = map[g.risk] || gates[g.id];
        });
        next[aid] = {
          ...next[aid],
          gates
        };
      });
      return next;
    });
    onFlash(`Applied "${preset === 'maxauto' ? 'Max autonomy' : preset[0].toUpperCase() + preset.slice(1)}" preset. Money & legal stay hard-gated.`);
  };

  // fleet-wide tallies
  let nAuto = 0,
    nApproval = 0,
    nOff = 0,
    nLocked = 0;
  Object.keys(POL).forEach(aid => POL[aid].gates.forEach(g => {
    if (g.locked) {
      nLocked++;
      return;
    }
    const p = state[aid].gates[g.id];
    if (p === 'auto') nAuto++;else if (p === 'approval') nApproval++;else nOff++;
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 18,
      fontWeight: 700
    }
  }, "Agent settings"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontSize: 14,
      color: 'var(--text-muted)'
    }
  }, "Decide, per action, what each agent does on its own vs. what waits for you. Changes save automatically.")), /*#__PURE__*/React.createElement(Card, {
    padding: "md",
    style: {
      border: '1px solid var(--border-default)',
      boxShadow: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--neutral-800)',
      marginBottom: 8
    }
  }, "Autonomy preset"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, [['conservative', 'Conservative'], ['balanced', 'Balanced'], ['maxauto', 'Max autonomy']].map(([id, label]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    onClick: () => applyPreset(id),
    style: {
      border: '1px solid var(--border-strong)',
      background: '#fff',
      cursor: 'pointer',
      borderRadius: 'var(--radius-md)',
      padding: '8px 14px',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--neutral-700)',
      fontFamily: 'var(--font-sans)'
    }
  }, label)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 18,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement(Tally, {
    n: nAuto,
    label: "Auto",
    color: "var(--decision-auto-fg)"
  }), /*#__PURE__*/React.createElement(Tally, {
    n: nApproval,
    label: "Need approval",
    color: "var(--decision-approval-fg)"
  }), /*#__PURE__*/React.createElement(Tally, {
    n: nOff,
    label: "Off",
    color: "var(--neutral-500)"
  }), /*#__PURE__*/React.createElement(Tally, {
    n: nLocked,
    label: "Hard-gated",
    color: "var(--risk-money-fg)"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: 'var(--alert-bg)',
      border: '1px solid var(--alert-border)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 14px',
      fontSize: 13,
      color: 'var(--alert-fg)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "5",
    y: "11",
    width: "14",
    height: "10",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 11V7a4 4 0 0 1 8 0v4"
  })), "Money movement and legal actions are permanently hard-gated \u2014 they always require your explicit approval and can't be automated."), FACETS.map(f => {
    const rows = AGENTS.filter(a => a.facet === f.id);
    if (!rows.length) return null;
    return /*#__PURE__*/React.createElement("div", {
      key: f.id
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '.05em',
        textTransform: 'uppercase',
        color: 'var(--text-subtle)',
        margin: '4px 0 8px'
      }
    }, f.name), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }
    }, rows.map(a => {
      const cfg = POL[a.agent];
      if (!cfg) return null;
      return /*#__PURE__*/React.createElement(Card, {
        key: a.agent,
        padding: "md",
        style: {
          border: '1px solid var(--border-default)',
          boxShadow: 'none'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 10,
          marginBottom: 12
        }
      }, /*#__PURE__*/React.createElement("h3", {
        style: {
          margin: 0,
          fontSize: 15.5,
          fontWeight: 700,
          textTransform: 'capitalize'
        }
      }, a.agent), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 12.5,
          color: 'var(--text-muted)'
        }
      }, a.role)), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }
      }, cfg.gates.map(g => /*#__PURE__*/React.createElement("div", {
        key: g.id,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 0',
          borderTop: '1px solid var(--border-hairline)'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1,
          fontSize: 13.5,
          color: 'var(--neutral-700)'
        }
      }, g.label), /*#__PURE__*/React.createElement(Badge, {
        risk: g.risk
      }), /*#__PURE__*/React.createElement(Seg, {
        value: state[a.agent].gates[g.id],
        locked: g.locked,
        onChange: p => setGate(a.agent, g.id, p)
      }))), cfg.thresholds.map(t => /*#__PURE__*/React.createElement("div", {
        key: t.id,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 0',
          borderTop: '1px solid var(--border-hairline)'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1,
          fontSize: 13.5,
          color: 'var(--neutral-700)'
        }
      }, t.label), /*#__PURE__*/React.createElement("input", {
        type: "range",
        min: t.min,
        max: t.max,
        step: t.step,
        value: state[a.agent].thresholds[t.id],
        onChange: e => setThreshold(a.agent, t.id, Number(e.target.value)),
        style: {
          width: 180,
          accentColor: 'var(--primary-500)'
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          minWidth: 56,
          textAlign: 'right',
          fontSize: 14,
          fontWeight: 700,
          color: 'var(--primary-600)'
        }
      }, t.unit === '$' ? '$' : '', state[a.agent].thresholds[t.id])))));
    })));
  }));
}
function Tally({
  n,
  label,
  color
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color,
      lineHeight: 1
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--text-muted)',
      marginTop: 3
    }
  }, label));
}
Object.assign(window, {
  Settings
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mission-control/Settings.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mission-control/Shell.jsx
try { (() => {
/* Mission Control shell: brand header + underline nav tabs. */
const {
  useState
} = React;
function Logo({
  size = 36
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/venueplus-logo-mark.png",
    alt: "VenuePlus",
    style: {
      height: size,
      width: 'auto'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      lineHeight: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      color: 'var(--neutral-900)'
    }
  }, "VenuePlus"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '.06em',
      textTransform: 'uppercase',
      color: 'var(--primary-600)'
    }
  }, "Mission Control")));
}
function ConsoleHeader({
  operator
}) {
  const {
    Avatar
  } = window.VenuePlusDesignSystem_17f1a7;
  return /*#__PURE__*/React.createElement("header", {
    style: {
      background: '#fff',
      borderBottom: '1px solid var(--border-default)',
      padding: '0 24px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 20
    }
  }, /*#__PURE__*/React.createElement(Logo, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      lineHeight: 1.2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--neutral-800)'
    }
  }, operator.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--text-muted)'
    }
  }, "Solo operator \xB7 1 of 1")), /*#__PURE__*/React.createElement(Avatar, {
    name: operator.name,
    size: "sm"
  })));
}
function Nav({
  tabs,
  active,
  onChange,
  badges = {}
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: 2,
      borderBottom: '1px solid var(--border-default)',
      background: '#fff',
      padding: '0 24px',
      position: 'sticky',
      top: 64,
      zIndex: 19
    }
  }, tabs.map(t => {
    const on = t.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      onClick: () => onChange(t.id),
      style: {
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        padding: '14px 14px 12px',
        fontFamily: 'var(--font-sans)',
        fontSize: 14,
        fontWeight: 500,
        color: on ? 'var(--primary-600)' : 'var(--text-muted)',
        borderBottom: `2px solid ${on ? 'var(--primary-500)' : 'transparent'}`,
        marginBottom: -1,
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        transition: 'var(--transition-colors)'
      }
    }, t.label, badges[t.id] > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        background: 'var(--status-pending-bg)',
        color: 'var(--status-pending-fg)',
        fontSize: 11,
        fontWeight: 700,
        borderRadius: 'var(--radius-full)',
        padding: '1px 7px',
        minWidth: 18,
        textAlign: 'center'
      }
    }, badges[t.id]));
  }));
}
Object.assign(window, {
  Logo,
  ConsoleHeader,
  Nav
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mission-control/Shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mission-control/data.js
try { (() => {
/* Mission Control — simulated fleet data.
   The full 14-agent fleet (see guidelines/agent-manual) feeding a single
   human-in-the-loop approval queue. Plain JS; attaches to window. */
(function () {
  // facet groups (order + label) used to organize the Agents tab
  const FACETS = [{
    id: 'supply-growth',
    name: 'Supply Growth'
  }, {
    id: 'demand-growth',
    name: 'Demand Growth'
  }, {
    id: 'onboarding-net',
    name: 'Onboarding & Network'
  }, {
    id: 'operations',
    name: 'Marketplace Operations'
  }, {
    id: 'customer-plat',
    name: 'Customer & Platform'
  }];
  const AGENTS = [
  // Supply Growth
  {
    agent: 'discovery',
    facet: 'supply-growth',
    role: 'Scrapes Google Places + Yelp for new venue & provider leads',
    last_run: '3 min ago',
    done: 142,
    needs_approval: 0,
    blocked: 0
  }, {
    agent: 'enrichment',
    facet: 'supply-growth',
    role: 'Finds emails & socials via Hunter.io, dedupes contacts',
    last_run: '3 min ago',
    done: 118,
    needs_approval: 0,
    blocked: 1
  }, {
    agent: 'scoring',
    facet: 'supply-growth',
    role: 'Ranks leads 0–100, auto-queues anything ≥ 60',
    last_run: '3 min ago',
    done: 118,
    needs_approval: 0,
    blocked: 0
  }, {
    agent: 'outreach',
    facet: 'supply-growth',
    role: 'Drafts personalized cold emails with Claude',
    last_run: '8 min ago',
    done: 64,
    needs_approval: 2,
    blocked: 0
  },
  // Demand Growth
  {
    agent: 'seo',
    facet: 'demand-growth',
    role: 'Generates venue listing pages & blog posts',
    last_run: '22 min ago',
    done: 37,
    needs_approval: 1,
    blocked: 0
  }, {
    agent: 'social',
    facet: 'demand-growth',
    role: 'Drafts Facebook & Instagram posts',
    last_run: '1 hr ago',
    done: 29,
    needs_approval: 0,
    blocked: 0
  }, {
    agent: 'campaign',
    facet: 'demand-growth',
    role: 'Runs venue / provider / renter drip sequences',
    last_run: '12 min ago',
    done: 51,
    needs_approval: 0,
    blocked: 0
  },
  // Onboarding & Network
  {
    agent: 'onboarding',
    facet: 'onboarding-net',
    role: 'Gets signed venues & providers fully live, priced & bookable',
    last_run: '9 min ago',
    done: 46,
    needs_approval: 1,
    blocked: 0
  }, {
    agent: 'network',
    facet: 'onboarding-net',
    role: 'Matches required services to bookings; watches coverage',
    last_run: '4 min ago',
    done: 83,
    needs_approval: 1,
    blocked: 1
  },
  // Marketplace Operations
  {
    agent: 'bookings',
    facet: 'operations',
    role: 'Runs the booking lifecycle, changes, refunds & disputes',
    last_run: '2 min ago',
    done: 159,
    needs_approval: 1,
    blocked: 0
  }, {
    agent: 'trust',
    facet: 'operations',
    role: 'Verifies identity, insurance & compliance; screens fraud',
    last_run: '7 min ago',
    done: 94,
    needs_approval: 1,
    blocked: 0
  }, {
    agent: 'finance',
    facet: 'operations',
    role: 'Collects, holds, pays out, reconciles & reports',
    last_run: '5 min ago',
    done: 71,
    needs_approval: 1,
    blocked: 0
  },
  // Customer & Platform
  {
    agent: 'support',
    facet: 'customer-plat',
    role: 'Triages & drafts replies for renters, hosts & providers',
    last_run: '1 min ago',
    done: 203,
    needs_approval: 1,
    blocked: 0
  }, {
    agent: 'monitor',
    facet: 'customer-plat',
    role: 'Hourly anomaly detection across the whole funnel',
    last_run: '6 min ago',
    done: 210,
    needs_approval: 0,
    blocked: 0
  }];
  const METRICS = {
    active_venues: 312,
    active_providers: 196,
    bookings_30d: 88,
    gmv: 48240,
    fees: 6753,
    total_bookings: 1204,
    categories: 9,
    cities: 10,
    fully_serviced_pct: 91,
    unserviceable: 2,
    bookings_per_venue: 3.9
  };
  const ESCALATIONS = [{
    id: 50,
    kind: 'listing_review',
    tool: 'activate_listing',
    risk: 'outbound',
    agent: 'onboarding',
    run_id: 310,
    run_goal: 'Onboard The Cathedral Hall (Austin)',
    reason: 'New listing is complete and ready to go live. Review before it\u2019s bookable.',
    created_at: '9 min ago',
    payload: {
      name: 'The Cathedral Hall',
      type: 'hall',
      city: 'Austin',
      state: 'TX',
      host: 'Marcus Reed',
      capacity: 150,
      price: 160,
      suggested_price: 160,
      photos: 6,
      completeness: 100,
      amenities: ['Parking', 'Restrooms', 'A/V system', 'Stage', 'Heating / AC'],
      required: ['security', 'cleaning', 'insurance'],
      checks: [['Photos verified', true], ['Capacity confirmed', true], ['Pricing within comps', true], ['Required services attached', true]]
    }
  }, {
    id: 51,
    kind: 'provider_review',
    tool: 'verify_provider',
    risk: 'legal',
    agent: 'trust',
    run_id: 316,
    run_goal: 'Verify new provider — Lone Star Event Security',
    reason: 'New provider passed automated checks. Approve to add them to the network.',
    created_at: '14 min ago',
    payload: {
      name: 'Lone Star Event Security',
      category: 'security',
      area: 'Austin, TX',
      radius: 25,
      team: 6,
      rate: 55,
      license: 'TX-4480231',
      insurance_status: 'valid',
      insurance_expires: 'Mar 2027',
      checks: [['Identity verified', true], ['Business license valid', true], ['Insurance certificate valid', true], ['No fraud signals', true]]
    }
  }, {
    id: 41,
    tool: 'send_outreach_email',
    risk: 'outbound',
    agent: 'outreach',
    run_id: 308,
    run_goal: 'Grow venue supply in Austin, TX',
    reason: 'Cold email to 1 new rooftop lead (The Cathedral, Austin). Draft scored 87/100.',
    created_at: '8 min ago',
    args: {
      to: 'events@thecathedral-atx.com',
      subject: 'Earn from your rooftop on event nights',
      template: 'venue_cold_v3'
    }
  }, {
    id: 43,
    tool: 'publish_seo_page',
    risk: 'outbound',
    agent: 'seo',
    run_id: 309,
    run_goal: 'Publish 5 venue landing pages for Nashville',
    reason: 'Publish listing page "Rooftop Venues in Nashville" (1,180 words, meta complete).',
    created_at: '22 min ago',
    args: {
      slug: 'rooftop-venues-nashville',
      target_keywords: ['nashville rooftop venue', 'event space nashville']
    }
  }, {
    id: 45,
    tool: 'dispatch_service_request',
    risk: 'financial',
    agent: 'network',
    run_id: 312,
    run_goal: 'Service booking #1204 (warehouse, 120 guests)',
    reason: 'Dispatch paid request to Lone Star Event Security — $55/hr × 5h. Only provider in range.',
    created_at: '4 min ago',
    args: {
      booking_id: 1204,
      provider: 'Lone Star Event Security',
      category: 'security',
      est_cost_usd: 275.0
    }
  }, {
    id: 46,
    tool: 'issue_refund',
    risk: 'money_movement',
    agent: 'bookings',
    run_id: 311,
    run_goal: 'Resolve flagged booking #1188',
    reason: 'Host cancelled 4h before event. Policy: full refund of $640 to renter.',
    created_at: '6 min ago',
    args: {
      booking_id: 1188,
      amount_usd: 640.0,
      reason: 'host_cancellation_within_24h'
    }
  }, {
    id: 47,
    tool: 'release_payout_batch',
    risk: 'money_movement',
    agent: 'finance',
    run_id: 313,
    run_goal: 'Weekly host & provider payouts',
    reason: 'Release 24 payouts totaling $9,420 for completed bookings. Reconciliation clean.',
    created_at: '11 min ago',
    args: {
      payouts: 24,
      total_usd: 9420.0,
      period: '2026-06-15 → 2026-06-21'
    }
  }, {
    id: 48,
    tool: 'suspend_listing',
    risk: 'legal',
    agent: 'trust',
    run_id: 314,
    run_goal: 'Insurance compliance sweep',
    reason: 'Venue "East Side Works" insurance certificate expired 3 days ago. Recommend suspend until renewed.',
    created_at: '7 min ago',
    args: {
      venue_id: 88,
      reason: 'expired_insurance',
      expired_on: '2026-06-19'
    }
  }, {
    id: 49,
    tool: 'send_support_reply',
    risk: 'outbound',
    agent: 'support',
    run_id: 315,
    run_goal: 'Ticket #5521 — renter dispute, frustrated',
    reason: 'Renter unhappy a food truck arrived 40 min late. Drafted apology + $50 goodwill credit offer.',
    created_at: '3 min ago',
    args: {
      ticket_id: 5521,
      sentiment: 'negative',
      proposes_credit_usd: 50.0
    }
  }];
  const RUNS = [{
    id: 316,
    goal: 'Verify new provider — Lone Star Event Security',
    status: 'needs_approval',
    executed: 4,
    total: 5,
    pending: 1,
    when: '14 min ago',
    jobs: [{
      agent: 'trust',
      status: 'needs_approval',
      blockers: [],
      actions: [{
        tool: 'verify_identity',
        risk: 'read',
        decision: 'auto',
        executed: true,
        reason: 'Owner identity confirmed via KYC.'
      }, {
        tool: 'validate_license',
        risk: 'read',
        decision: 'auto',
        executed: true,
        reason: 'License TX-4480231 active & valid.'
      }, {
        tool: 'validate_insurance',
        risk: 'read',
        decision: 'auto',
        executed: true,
        reason: 'Insurance certificate valid through Mar 2027.'
      }, {
        tool: 'fraud_scan',
        risk: 'read',
        decision: 'auto',
        executed: true,
        reason: 'No fraud signals.'
      }, {
        tool: 'verify_provider',
        risk: 'legal',
        decision: 'require_approval',
        executed: false,
        reason: 'Adding provider to network — operator approval.'
      }]
    }]
  }, {
    id: 315,
    goal: 'Ticket #5521 — renter dispute, frustrated',
    status: 'needs_approval',
    executed: 2,
    total: 3,
    pending: 1,
    when: '3 min ago',
    jobs: [{
      agent: 'support',
      status: 'needs_approval',
      blockers: [],
      actions: [{
        tool: 'load_ticket_context',
        risk: 'read',
        decision: 'auto',
        executed: true,
        reason: 'Pulled booking #1197 + provider arrival log.'
      }, {
        tool: 'classify_sentiment',
        risk: 'read',
        decision: 'auto',
        executed: true,
        reason: 'Negative; flagged at-risk renter.'
      }, {
        tool: 'send_support_reply',
        risk: 'outbound',
        decision: 'require_approval',
        executed: false,
        reason: 'Customer-facing apology + $50 credit — needs operator.'
      }]
    }]
  }, {
    id: 314,
    goal: 'Insurance compliance sweep',
    status: 'needs_approval',
    executed: 3,
    total: 4,
    pending: 1,
    when: '7 min ago',
    jobs: [{
      agent: 'trust',
      status: 'needs_approval',
      blockers: [],
      actions: [{
        tool: 'scan_insurance_certs',
        risk: 'read',
        decision: 'auto',
        executed: true,
        reason: 'Checked 312 venues; 1 expired, 2 expiring soon.'
      }, {
        tool: 'notify_host_renewal',
        risk: 'outbound',
        decision: 'auto',
        executed: true,
        reason: 'Sent renewal reminders to 3 hosts.'
      }, {
        tool: 'flag_listing',
        risk: 'internal_write',
        decision: 'auto',
        executed: true,
        reason: 'Flagged East Side Works internally.'
      }, {
        tool: 'suspend_listing',
        risk: 'legal',
        decision: 'require_approval',
        executed: false,
        reason: 'Hard-gated legal action — awaiting operator.'
      }]
    }]
  }, {
    id: 313,
    goal: 'Weekly host & provider payouts',
    status: 'needs_approval',
    executed: 3,
    total: 4,
    pending: 1,
    when: '11 min ago',
    jobs: [{
      agent: 'finance',
      status: 'needs_approval',
      blockers: [],
      actions: [{
        tool: 'gather_completed_bookings',
        risk: 'read',
        decision: 'auto',
        executed: true,
        reason: 'Found 24 completed bookings since last run.'
      }, {
        tool: 'compute_fee_splits',
        risk: 'internal_write',
        decision: 'auto',
        executed: true,
        reason: 'Computed platform fees + net payouts.'
      }, {
        tool: 'reconcile',
        risk: 'read',
        decision: 'auto',
        executed: true,
        reason: 'Reconciled against Stripe — zero variance.'
      }, {
        tool: 'release_payout_batch',
        risk: 'money_movement',
        decision: 'require_approval',
        executed: false,
        reason: 'Hard-gated: $9,420 across 24 payouts.'
      }]
    }]
  }, {
    id: 312,
    goal: 'Service booking #1204 (warehouse, 120 guests)',
    status: 'needs_approval',
    executed: 2,
    total: 3,
    pending: 1,
    when: '4 min ago',
    jobs: [{
      agent: 'network',
      status: 'needs_approval',
      blockers: [],
      actions: [{
        tool: 'match_providers',
        risk: 'read',
        decision: 'auto',
        executed: true,
        reason: 'Required: security. 1 provider in range (Lone Star).'
      }, {
        tool: 'rank_providers',
        risk: 'read',
        decision: 'auto',
        executed: true,
        reason: 'Single-provider dependency — flagged to Discovery.'
      }, {
        tool: 'dispatch_service_request',
        risk: 'financial',
        decision: 'require_approval',
        executed: false,
        reason: 'Paid dispatch ($275) — needs operator.'
      }]
    }]
  }, {
    id: 311,
    goal: 'Resolve flagged booking #1188',
    status: 'needs_approval',
    executed: 3,
    total: 4,
    pending: 1,
    when: '6 min ago',
    jobs: [{
      agent: 'bookings',
      status: 'needs_approval',
      blockers: [],
      actions: [{
        tool: 'read_booking',
        risk: 'read',
        decision: 'auto',
        executed: true,
        reason: 'Loaded booking #1188 + cancellation timestamp.'
      }, {
        tool: 'classify_cancellation',
        risk: 'read',
        decision: 'auto',
        executed: true,
        reason: 'Host cancelled 4h prior → within-24h policy.'
      }, {
        tool: 'notify_renter',
        risk: 'outbound',
        decision: 'auto',
        executed: true,
        reason: 'Sent "your event was cancelled" email.'
      }, {
        tool: 'issue_refund',
        risk: 'money_movement',
        decision: 'require_approval',
        executed: false,
        reason: 'Hard-gated: moving $640. Awaiting operator.'
      }]
    }]
  }, {
    id: 310,
    goal: 'Onboard The Cathedral Hall (Austin)',
    status: 'needs_approval',
    executed: 4,
    total: 5,
    pending: 1,
    when: '9 min ago',
    jobs: [{
      agent: 'onboarding',
      status: 'needs_approval',
      blockers: [],
      actions: [{
        tool: 'draft_profile',
        risk: 'internal_write',
        decision: 'auto',
        executed: true,
        reason: 'Drafted listing copy from host intake.'
      }, {
        tool: 'suggest_pricing',
        risk: 'internal_write',
        decision: 'auto',
        executed: true,
        reason: 'Suggested $160/hr from 6 local comps.'
      }, {
        tool: 'validate_completeness',
        risk: 'read',
        decision: 'auto',
        executed: true,
        reason: 'Photos, capacity, availability complete.'
      }, {
        tool: 'attach_required_services',
        risk: 'internal_write',
        decision: 'auto',
        executed: true,
        reason: 'Added mandatory security + cleaning rules.'
      }, {
        tool: 'activate_listing',
        risk: 'outbound',
        decision: 'require_approval',
        executed: false,
        reason: 'Going live — operator review.'
      }]
    }]
  }, {
    id: 309,
    goal: 'Publish 5 venue landing pages for Nashville',
    status: 'needs_approval',
    executed: 9,
    total: 10,
    pending: 1,
    when: '22 min ago',
    jobs: [{
      agent: 'seo',
      status: 'needs_approval',
      blockers: [],
      actions: [{
        tool: 'draft_seo_page',
        risk: 'internal_write',
        decision: 'auto',
        executed: true,
        reason: 'Drafted 5 listing pages from venue data.'
      }, {
        tool: 'generate_meta',
        risk: 'internal_write',
        decision: 'auto',
        executed: true,
        reason: 'Titles + descriptions within length limits.'
      }, {
        tool: 'publish_seo_page',
        risk: 'outbound',
        decision: 'require_approval',
        executed: false,
        reason: 'Publishing live page — operator review on first of batch.'
      }]
    }]
  }, {
    id: 308,
    goal: 'Grow venue supply in Austin, TX',
    status: 'needs_approval',
    executed: 14,
    total: 16,
    pending: 2,
    when: '8 min ago',
    jobs: [{
      agent: 'discovery',
      status: 'done',
      blockers: [],
      actions: [{
        tool: 'search_places',
        risk: 'read',
        decision: 'auto',
        executed: true,
        reason: 'Found 38 rooftop / warehouse candidates in Austin.'
      }]
    }, {
      agent: 'enrichment',
      status: 'done',
      blockers: [],
      actions: [{
        tool: 'find_contact',
        risk: 'read',
        decision: 'auto',
        executed: true,
        reason: 'Resolved emails for 31 of 38 leads.'
      }]
    }, {
      agent: 'scoring',
      status: 'done',
      blockers: [],
      actions: [{
        tool: 'score_leads',
        risk: 'read',
        decision: 'auto',
        executed: true,
        reason: 'Auto-queued 12 leads scoring ≥ 60.'
      }]
    }, {
      agent: 'outreach',
      status: 'needs_approval',
      blockers: [],
      actions: [{
        tool: 'draft_email',
        risk: 'internal_write',
        decision: 'auto',
        executed: true,
        reason: 'Drafted 12 personalized cold emails.'
      }, {
        tool: 'send_outreach_email',
        risk: 'outbound',
        decision: 'require_approval',
        executed: false,
        reason: '2 top-scoring drafts held for operator review.'
      }]
    }]
  }, {
    id: 305,
    goal: 'Re-engage lapsed providers (no jobs in 30d)',
    status: 'done',
    executed: 7,
    total: 7,
    pending: 0,
    when: '2 hr ago',
    jobs: [{
      agent: 'campaign',
      status: 'done',
      blockers: [],
      actions: [{
        tool: 'enroll_drip',
        risk: 'internal_write',
        decision: 'auto',
        executed: true,
        reason: 'Enrolled 23 providers in win-back drip.'
      }, {
        tool: 'send_campaign_email',
        risk: 'outbound',
        decision: 'auto',
        executed: true,
        reason: 'Below auto-send threshold; sent step 1.'
      }]
    }]
  }, {
    id: 301,
    goal: 'Daily funnel health check',
    status: 'done',
    executed: 5,
    total: 5,
    pending: 0,
    when: '5 hr ago',
    jobs: [{
      agent: 'monitor',
      status: 'done',
      blockers: [],
      actions: [{
        tool: 'scan_funnel',
        risk: 'read',
        decision: 'auto',
        executed: true,
        reason: 'No anomalies above threshold.'
      }]
    }]
  }];
  window.MC_DATA = {
    FACETS,
    AGENTS,
    METRICS,
    ESCALATIONS,
    RUNS,
    POLICIES
  };

  /* Per-agent action policies for the Settings screen.
     policy: 'auto' | 'approval' | 'off'. Gates marked locked are money- or
     legal-risk and cannot be set to auto — the platform's hard gates. */
  var POLICIES = {
    discovery: {
      gates: [{
        id: 'write_leads',
        label: 'Write new leads to the database',
        risk: 'internal_write',
        policy: 'auto'
      }],
      thresholds: [{
        id: 'cities',
        label: 'Active discovery cities',
        value: 10,
        min: 1,
        max: 25,
        step: 1
      }]
    },
    enrichment: {
      gates: [{
        id: 'enrich',
        label: 'Enrich & verify contacts',
        risk: 'internal_write',
        policy: 'auto'
      }],
      thresholds: [{
        id: 'budget',
        label: 'Monthly enrichment budget',
        value: 500,
        min: 0,
        max: 2000,
        step: 50,
        unit: '$'
      }]
    },
    scoring: {
      gates: [{
        id: 'auto_queue',
        label: 'Auto-queue hot leads to Outreach',
        risk: 'internal_write',
        policy: 'auto'
      }],
      thresholds: [{
        id: 'threshold',
        label: 'Auto-queue leads scoring at or above',
        value: 60,
        min: 0,
        max: 100,
        step: 5
      }]
    },
    outreach: {
      gates: [{
        id: 'send_email',
        label: 'Send first-touch cold emails',
        risk: 'outbound',
        policy: 'approval'
      }, {
        id: 'send_followup',
        label: 'Send follow-ups in an active sequence',
        risk: 'outbound',
        policy: 'approval'
      }],
      thresholds: [{
        id: 'daily_cap',
        label: 'Max outbound emails per day',
        value: 50,
        min: 0,
        max: 300,
        step: 10
      }]
    },
    seo: {
      gates: [{
        id: 'publish',
        label: 'Publish live listing pages & posts',
        risk: 'outbound',
        policy: 'approval'
      }, {
        id: 'edit_meta',
        label: 'Edit metadata on already-live pages',
        risk: 'internal_write',
        policy: 'auto'
      }],
      thresholds: []
    },
    social: {
      gates: [{
        id: 'post',
        label: 'Publish social posts',
        risk: 'outbound',
        policy: 'approval'
      }, {
        id: 'reply',
        label: 'Reply to comments & DMs',
        risk: 'outbound',
        policy: 'approval'
      }],
      thresholds: []
    },
    campaign: {
      gates: [{
        id: 'enroll',
        label: 'Enroll users into journeys',
        risk: 'internal_write',
        policy: 'auto'
      }, {
        id: 'send',
        label: 'Send lifecycle campaign messages',
        risk: 'outbound',
        policy: 'approval'
      }],
      thresholds: [{
        id: 'freq_cap',
        label: 'Max messages per user per week',
        value: 3,
        min: 1,
        max: 10,
        step: 1
      }]
    },
    onboarding: {
      gates: [{
        id: 'set_price',
        label: 'Apply suggested pricing',
        risk: 'internal_write',
        policy: 'auto'
      }, {
        id: 'activate',
        label: 'Activate a listing (go live)',
        risk: 'outbound',
        policy: 'approval'
      }, {
        id: 'host_msg',
        label: 'Send host-facing messages',
        risk: 'outbound',
        policy: 'approval'
      }],
      thresholds: []
    },
    network: {
      gates: [{
        id: 'match',
        label: 'Auto-match providers to bookings',
        risk: 'read',
        policy: 'auto'
      }, {
        id: 'dispatch',
        label: 'Dispatch paid service requests',
        risk: 'financial',
        policy: 'approval'
      }],
      thresholds: []
    },
    bookings: {
      gates: [{
        id: 'confirm',
        label: 'Confirm bookings & hold inventory',
        risk: 'internal_write',
        policy: 'auto'
      }, {
        id: 'dispute_msg',
        label: 'Send dispute-resolution messages',
        risk: 'outbound',
        policy: 'approval'
      }, {
        id: 'refund',
        label: 'Issue refunds & goodwill credits',
        risk: 'money_movement',
        policy: 'approval',
        locked: true
      }],
      thresholds: []
    },
    trust: {
      gates: [{
        id: 'checks',
        label: 'Run identity & insurance checks',
        risk: 'read',
        policy: 'auto'
      }, {
        id: 'suspend',
        label: 'Suspend or reinstate listings',
        risk: 'legal',
        policy: 'approval',
        locked: true
      }],
      thresholds: []
    },
    finance: {
      gates: [{
        id: 'capture',
        label: 'Capture pre-authorized payments',
        risk: 'internal_write',
        policy: 'auto'
      }, {
        id: 'payout',
        label: 'Release host & provider payouts',
        risk: 'money_movement',
        policy: 'approval',
        locked: true
      }, {
        id: 'refund',
        label: 'Execute approved refunds',
        risk: 'money_movement',
        policy: 'approval',
        locked: true
      }],
      thresholds: []
    },
    support: {
      gates: [{
        id: 'route',
        label: 'Route & tag tickets',
        risk: 'internal_write',
        policy: 'auto'
      }, {
        id: 'reply',
        label: 'Send support replies',
        risk: 'outbound',
        policy: 'approval'
      }, {
        id: 'faq_auto',
        label: 'Auto-send vetted FAQ answers',
        risk: 'outbound',
        policy: 'off'
      }],
      thresholds: [{
        id: 'sla',
        label: 'First-response SLA (minutes)',
        value: 15,
        min: 5,
        max: 120,
        step: 5
      }]
    },
    monitor: {
      gates: [{
        id: 'scan',
        label: 'Scan funnel & agent health',
        risk: 'read',
        policy: 'auto'
      }, {
        id: 'open_esc',
        label: 'Open escalations for you',
        risk: 'internal_write',
        policy: 'auto'
      }],
      thresholds: [{
        id: 'sensitivity',
        label: 'Anomaly sensitivity (1 calm – 5 strict)',
        value: 3,
        min: 1,
        max: 5,
        step: 1
      }]
    }
  };
  window.MC_DATA.POLICIES = POLICIES;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mission-control/data.js", error: String((e && e.message) || e) }); }

// ui_kits/mobile-operator/app.jsx
try { (() => {
/* Mobile operator — on-the-go approval queue. Clears escalations from a phone.
   Reuses MC_DATA (shared with the desktop console) + the Badge component. */
const {
  useState: useMobState,
  useEffect: useMobEffect
} = React;
const RISK_LABEL = {
  read: 'Read',
  internal_write: 'Internal',
  outbound: 'Outbound',
  financial: 'Financial',
  money_movement: 'Money',
  legal: 'Legal'
};
function Icon({
  name,
  size = 22,
  color = 'currentColor'
}) {
  const p = {
    home: /*#__PURE__*/React.createElement("path", {
      d: "M3 10.5 12 3l9 7.5M5 9.5V20h5v-6h4v6h5V9.5"
    }),
    inbox: /*#__PURE__*/React.createElement("path", {
      d: "M3 13h4l2 3h6l2-3h4M5 5h14l2 8v6H3v-6L5 5Z"
    }),
    pulse: /*#__PURE__*/React.createElement("path", {
      d: "M3 12h4l3 8 4-16 3 8h4"
    }),
    sliders: /*#__PURE__*/React.createElement("path", {
      d: "M4 8h10M18 8h2M4 16h2M10 16h10M14 6v4M8 14v4"
    })
  }[name];
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, p);
}
function TopBar({
  fleetEnabled
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '52px 18px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/venueplus-logo-mark.png",
    alt: "",
    style: {
      height: 30
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 800,
      color: 'var(--neutral-900)',
      lineHeight: 1
    }
  }, "Mission Control"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, "Avery Stone \xB7 solo operator")), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 11,
      fontWeight: 600,
      padding: '4px 9px',
      borderRadius: 999,
      background: fleetEnabled ? 'var(--status-success-bg)' : 'var(--status-error-bg)',
      color: fleetEnabled ? 'var(--status-success-fg)' : 'var(--status-error-fg)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: 'currentColor'
    }
  }), fleetEnabled ? 'Live' : 'Halted'));
}

/* ---------------- Queue ---------------- */
function Queue({
  escalations,
  onResolve
}) {
  const {
    Badge
  } = window.VenuePlusDesignSystem_17f1a7;
  const [open, setOpen] = useMobState(null);
  const HARD = new Set(['money_movement', 'legal']);
  if (!escalations.length) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '64px 24px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: 'var(--status-success-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px',
        fontSize: 30,
        color: 'var(--status-success-fg)'
      }
    }, "\u2713"), /*#__PURE__*/React.createElement("h2", {
      style: {
        margin: '0 0 6px',
        fontSize: 19,
        fontWeight: 700
      }
    }, "Queue clear"), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 14,
        color: 'var(--text-muted)'
      }
    }, "Nothing needs you right now. The fleet keeps running."));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 14px 20px'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '8px 4px 12px',
      fontSize: 17,
      fontWeight: 700
    }
  }, "Approval queue \xB7 ", escalations.length), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, escalations.map(e => {
    const gated = HARD.has(e.risk);
    const isOpen = open === e.id;
    return /*#__PURE__*/React.createElement("div", {
      key: e.id,
      style: {
        background: '#fff',
        border: `1px solid ${gated ? '#fecaca' : 'var(--border-default)'}`,
        borderRadius: 16,
        padding: 14,
        boxShadow: 'var(--shadow-sm)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        flexWrap: 'wrap',
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      risk: e.risk
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: 'var(--text-subtle)',
        textTransform: 'capitalize'
      }
    }, e.agent), /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 'auto',
        fontSize: 11,
        color: 'var(--text-subtle)'
      }
    }, e.created_at)), /*#__PURE__*/React.createElement("code", {
      style: {
        fontSize: 12.5,
        fontFamily: 'ui-monospace, monospace',
        color: 'var(--neutral-800)'
      }
    }, e.tool), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '6px 0 0',
        fontSize: 14,
        lineHeight: 1.45,
        color: 'var(--neutral-700)'
      }
    }, e.reason), gated && /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '8px 0 0',
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--status-error-fg)'
      }
    }, "\u26A0 Hard-gated ", RISK_LABEL[e.risk], " action"), e.args && /*#__PURE__*/React.createElement("button", {
      onClick: () => setOpen(isOpen ? null : e.id),
      style: {
        marginTop: 8,
        border: 'none',
        background: 'none',
        padding: 0,
        cursor: 'pointer',
        color: 'var(--primary-600)',
        fontSize: 12.5,
        fontWeight: 600,
        fontFamily: 'var(--font-sans)'
      }
    }, isOpen ? 'Hide details' : 'View details'), isOpen && e.args && /*#__PURE__*/React.createElement("pre", {
      style: {
        margin: '8px 0 0',
        background: 'var(--neutral-50)',
        border: '1px solid var(--border-hairline)',
        borderRadius: 8,
        padding: 10,
        fontSize: 11,
        overflowX: 'auto',
        color: 'var(--neutral-700)'
      }
    }, JSON.stringify(e.args, null, 2)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => onResolve(e.id, true),
      style: {
        flex: 1,
        border: 'none',
        cursor: 'pointer',
        borderRadius: 10,
        padding: '11px 0',
        fontSize: 14,
        fontWeight: 600,
        color: '#fff',
        background: 'var(--status-success-fg)',
        fontFamily: 'var(--font-sans)'
      }
    }, "Approve"), /*#__PURE__*/React.createElement("button", {
      onClick: () => onResolve(e.id, false),
      style: {
        flex: 1,
        cursor: 'pointer',
        borderRadius: 10,
        padding: '11px 0',
        fontSize: 14,
        fontWeight: 600,
        color: 'var(--status-error-fg)',
        background: '#fff',
        border: '1px solid #fecaca',
        fontFamily: 'var(--font-sans)'
      }
    }, "Reject")));
  })));
}

/* ---------------- Home ---------------- */
function Home({
  metrics,
  openEsc,
  fleetEnabled,
  onToggleFleet,
  onGoQueue
}) {
  const money = n => '$' + n.toLocaleString('en-US');
  const tile = (label, value, accent) => /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid var(--border-default)',
      borderRadius: 14,
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      color: accent || 'var(--neutral-900)',
      marginTop: 2,
      lineHeight: 1.1
    }
  }, value));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 14px 20px'
    }
  }, openEsc > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: onGoQueue,
    style: {
      width: '100%',
      textAlign: 'left',
      cursor: 'pointer',
      border: '1px solid var(--alert-border)',
      background: 'var(--alert-bg)',
      color: 'var(--alert-fg)',
      borderRadius: 14,
      padding: '13px 16px',
      fontFamily: 'var(--font-sans)',
      fontSize: 14,
      margin: '8px 0 14px'
    }
  }, /*#__PURE__*/React.createElement("strong", null, openEsc), " awaiting your approval\xA0\u2192"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10
    }
  }, tile('Open escalations', openEsc, openEsc > 0 ? 'var(--status-pending-fg)' : 'var(--status-success-fg)'), tile('Fleet', fleetEnabled ? 'Live' : 'Halted', fleetEnabled ? 'var(--status-success-fg)' : 'var(--status-error-fg)'), tile('GMV (30d)', money(metrics.gmv)), tile('Bookings (30d)', metrics.bookings_30d), tile('Active venues', metrics.active_venues), tile('Providers', metrics.active_providers)), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid var(--border-default)',
      borderRadius: 14,
      padding: 16,
      marginTop: 14,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      fontWeight: 700
    }
  }, "Fleet kill switch"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, fleetEnabled ? 'Halt all new runs' : 'Re-enable the fleet')), /*#__PURE__*/React.createElement("button", {
    onClick: onToggleFleet,
    style: {
      border: 'none',
      cursor: 'pointer',
      borderRadius: 10,
      padding: '9px 16px',
      fontSize: 13.5,
      fontWeight: 600,
      color: '#fff',
      background: fleetEnabled ? 'var(--status-error-fg)' : 'var(--status-success-fg)',
      fontFamily: 'var(--font-sans)'
    }
  }, fleetEnabled ? 'Disable' : 'Enable')));
}

/* ---------------- Fleet ---------------- */
function FleetList({
  agents
}) {
  const {
    Badge
  } = window.VenuePlusDesignSystem_17f1a7;
  const FACETS = window.MC_DATA.FACETS;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 14px 20px'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '8px 4px 12px',
      fontSize: 17,
      fontWeight: 700
    }
  }, "Fleet \xB7 ", agents.length, " agents"), FACETS.map(f => {
    const rows = agents.filter(a => a.facet === f.id);
    return /*#__PURE__*/React.createElement("div", {
      key: f.id,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: '.05em',
        textTransform: 'uppercase',
        color: 'var(--text-subtle)',
        margin: '0 4px 7px'
      }
    }, f.name), /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#fff',
        border: '1px solid var(--border-default)',
        borderRadius: 14,
        overflow: 'hidden'
      }
    }, rows.map((a, i) => /*#__PURE__*/React.createElement("div", {
      key: a.agent,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '11px 13px',
        borderTop: i ? '1px solid var(--border-hairline)' : 'none'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 14,
        fontWeight: 600,
        textTransform: 'capitalize'
      }
    }, a.agent), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 11.5,
        color: 'var(--text-subtle)'
      }
    }, a.done, " done \xB7 last ", a.last_run)), a.needs_approval > 0 ? /*#__PURE__*/React.createElement(Badge, {
      status: "needs_approval"
    }, a.needs_approval) : /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: 'var(--status-success-fg)'
      }
    }, "\u2713")))));
  }));
}

/* ---------------- App ---------------- */
function MobileApp() {
  const seed = window.MC_DATA;
  const [tab, setTab] = useMobState('queue');
  const [escalations, setEscalations] = useMobState(seed.ESCALATIONS);
  const [fleetEnabled, setFleetEnabled] = useMobState(true);
  const [toast, setToast] = useMobState(null);
  const flash = (msg, ok = true) => {
    setToast({
      msg,
      ok
    });
    setTimeout(() => setToast(null), 2200);
  };
  const resolve = (id, approve) => {
    setEscalations(l => l.filter(e => e.id !== id));
    flash(`${approve ? 'Approved' : 'Rejected'} #${id}`, approve);
  };
  const toggleFleet = () => setFleetEnabled(v => {
    flash(`Fleet ${v ? 'disabled' : 'enabled'}`, !v);
    return !v;
  });
  const NAV = [{
    id: 'home',
    label: 'Home',
    icon: 'home'
  }, {
    id: 'queue',
    label: 'Queue',
    icon: 'inbox',
    badge: escalations.length
  }, {
    id: 'fleet',
    label: 'Fleet',
    icon: 'pulse'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-console)',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    fleetEnabled: fleetEnabled
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      borderTop: '1px solid var(--border-default)'
    }
  }, tab === 'home' && /*#__PURE__*/React.createElement(Home, {
    metrics: seed.METRICS,
    openEsc: escalations.length,
    fleetEnabled: fleetEnabled,
    onToggleFleet: toggleFleet,
    onGoQueue: () => setTab('queue')
  }), tab === 'queue' && /*#__PURE__*/React.createElement(Queue, {
    escalations: escalations,
    onResolve: resolve
  }), tab === 'fleet' && /*#__PURE__*/React.createElement(FleetList, {
    agents: seed.AGENTS
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      borderTop: '1px solid var(--border-default)',
      background: 'rgba(255,255,255,.92)',
      backdropFilter: 'blur(12px)',
      paddingBottom: 22,
      paddingTop: 8
    }
  }, NAV.map(n => {
    const on = tab === n.id;
    return /*#__PURE__*/React.createElement("button", {
      key: n.id,
      onClick: () => setTab(n.id),
      style: {
        flex: 1,
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        position: 'relative',
        color: on ? 'var(--primary-600)' : 'var(--neutral-400)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: n.icon,
      size: 23
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10.5,
        fontWeight: on ? 600 : 500
      }
    }, n.label), n.badge > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: -3,
        right: '50%',
        marginRight: -22,
        background: 'var(--accent-500)',
        color: '#fff',
        fontSize: 10,
        fontWeight: 700,
        borderRadius: 999,
        minWidth: 17,
        height: 17,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 4px'
      }
    }, n.badge));
  })), toast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 96,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 80,
      background: toast.ok ? 'var(--status-success-fg)' : 'var(--status-error-fg)',
      color: '#fff',
      padding: '9px 16px',
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 600,
      boxShadow: 'var(--shadow-lg)',
      whiteSpace: 'nowrap'
    }
  }, toast.msg));
}
function Root() {
  const {
    IOSDevice
  } = window;
  const [scale, setScale] = useMobState(1);
  useMobEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerHeight - 40) / 874, (window.innerWidth - 40) / 402));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--neutral-100)',
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      transform: `scale(${scale})`,
      transformOrigin: 'center'
    }
  }, /*#__PURE__*/React.createElement(IOSDevice, null, /*#__PURE__*/React.createElement(MobileApp, null))));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(Root, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile-operator/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile-operator/ios-frame.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// iOS.jsx — Simplified iOS 26 (Liquid Glass) device frame
// Based on the iOS 26 UI Kit + Figma status bar spec. No assets, no deps.
// Exports (to window): IOSDevice, IOSStatusBar, IOSNavBar, IOSGlassPill, IOSList, IOSListRow, IOSKeyboard
//
// Usage — wrap your screen content in <IOSDevice> to get the bezel, status bar
// and home indicator (props: title, dark, keyboard):
//
//   <IOSDevice title="Settings">
//     ...your screen content...
//   </IOSDevice>
//   <IOSDevice dark title="Search" keyboard>…</IOSDevice>
/* END USAGE */

// ─────────────────────────────────────────────────────────────
// Status bar
// ─────────────────────────────────────────────────────────────
function IOSStatusBar({
  dark = false,
  time = '9:41'
}) {
  const c = dark ? '#fff' : '#000';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 154,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '21px 24px 19px',
      boxSizing: 'border-box',
      position: 'relative',
      zIndex: 20,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 1.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: '-apple-system, "SF Pro", system-ui',
      fontWeight: 590,
      fontSize: 17,
      lineHeight: '22px',
      color: c
    }
  }, time)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingTop: 1,
      paddingRight: 1
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "12",
    viewBox: "0 0 19 12"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "7.5",
    width: "3.2",
    height: "4.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "4.8",
    y: "5",
    width: "3.2",
    height: "7",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "9.6",
    y: "2.5",
    width: "3.2",
    height: "9.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14.4",
    y: "0",
    width: "3.2",
    height: "12",
    rx: "0.7",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "12",
    viewBox: "0 0 17 12"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z",
    fill: c
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8.5",
    cy: "10.5",
    r: "1.5",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "27",
    height: "13",
    viewBox: "0 0 27 13"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0.5",
    y: "0.5",
    width: "23",
    height: "12",
    rx: "3.5",
    stroke: c,
    strokeOpacity: "0.35",
    fill: "none"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: "20",
    height: "9",
    rx: "2",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z",
    fill: c,
    fillOpacity: "0.4"
  }))));
}

// ─────────────────────────────────────────────────────────────
// Liquid glass pill — blur + tint + shine
// ─────────────────────────────────────────────────────────────
function IOSGlassPill({
  children,
  dark = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 44,
      minWidth: 44,
      borderRadius: 9999,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: dark ? '0 2px 6px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.06)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.28)' : 'rgba(255,255,255,0.5)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15), inset -1px -1px 1px rgba(255,255,255,0.08)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      padding: '0 4px'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Navigation bar — glass pills + large title
// ─────────────────────────────────────────────────────────────
function IOSNavBar({
  title = 'Title',
  dark = false,
  trailingIcon = true
}) {
  const muted = dark ? 'rgba(255,255,255,0.6)' : '#404040';
  const text = dark ? '#fff' : '#000';
  const pillIcon = content => /*#__PURE__*/React.createElement(IOSGlassPill, {
    dark: dark
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, content));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      paddingTop: 62,
      paddingBottom: 10,
      position: 'relative',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px'
    }
  }, pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "20",
    viewBox: "0 0 12 20",
    fill: "none",
    style: {
      marginLeft: -1
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 2L2 10l8 8",
    stroke: muted,
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), trailingIcon && pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "6",
    viewBox: "0 0 22 6"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "3",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "19",
    cy: "3",
    r: "2.5",
    fill: muted
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px',
      fontFamily: '-apple-system, system-ui',
      fontSize: 34,
      fontWeight: 700,
      lineHeight: '41px',
      color: text,
      letterSpacing: 0.4
    }
  }, title));
}

// ─────────────────────────────────────────────────────────────
// Grouped list (inset card, r:26) + row (52px)
// ─────────────────────────────────────────────────────────────
function IOSListRow({
  title,
  detail,
  icon,
  chevron = true,
  isLast = false,
  dark = false
}) {
  const text = dark ? '#fff' : '#000';
  const sec = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const ter = dark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)';
  const sep = dark ? 'rgba(84,84,88,0.65)' : 'rgba(60,60,67,0.12)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      minHeight: 52,
      padding: '0 16px',
      position: 'relative',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      letterSpacing: -0.43
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 7,
      background: icon,
      marginRight: 12,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      color: text
    }
  }, title), detail && /*#__PURE__*/React.createElement("span", {
    style: {
      color: sec,
      marginRight: 6
    }
  }, detail), chevron && /*#__PURE__*/React.createElement("svg", {
    width: "8",
    height: "14",
    viewBox: "0 0 8 14",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 1l6 6-6 6",
    stroke: ter,
    strokeWidth: "2",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), !isLast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: icon ? 58 : 16,
      height: 0.5,
      background: sep
    }
  }));
}
function IOSList({
  header,
  children,
  dark = false
}) {
  const hc = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const bg = dark ? '#1C1C1E' : '#fff';
  return /*#__PURE__*/React.createElement("div", null, header && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '-apple-system, system-ui',
      fontSize: 13,
      color: hc,
      textTransform: 'uppercase',
      padding: '8px 36px 6px',
      letterSpacing: -0.08
    }
  }, header), /*#__PURE__*/React.createElement("div", {
    style: {
      background: bg,
      borderRadius: 26,
      margin: '0 16px',
      overflow: 'hidden'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Device frame
// ─────────────────────────────────────────────────────────────
function IOSDevice({
  children,
  width = 402,
  height = 874,
  dark = false,
  title,
  keyboard = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      borderRadius: 48,
      overflow: 'hidden',
      position: 'relative',
      background: dark ? '#000' : '#F2F2F7',
      boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      fontFamily: '-apple-system, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 11,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 126,
      height: 37,
      borderRadius: 24,
      background: '#000',
      zIndex: 50
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement(IOSStatusBar, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }
  }, title !== undefined && /*#__PURE__*/React.createElement(IOSNavBar, {
    title: title,
    dark: dark
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, children), keyboard && /*#__PURE__*/React.createElement(IOSKeyboard, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 60,
      height: 34,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingBottom: 8,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 139,
      height: 5,
      borderRadius: 100,
      background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)'
    }
  })));
}

// ─────────────────────────────────────────────────────────────
// Keyboard — iOS 26 liquid glass
// ─────────────────────────────────────────────────────────────
function IOSKeyboard({
  dark = false
}) {
  const glyph = dark ? 'rgba(255,255,255,0.7)' : '#595959';
  const sugg = dark ? 'rgba(255,255,255,0.6)' : '#333';
  const keyBg = dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)';

  // special-key icons
  const icons = {
    shift: /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "17",
      viewBox: "0 0 19 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9.5 1L1 9.5h4.5V16h8V9.5H18L9.5 1z",
      fill: glyph
    })),
    del: /*#__PURE__*/React.createElement("svg", {
      width: "23",
      height: "17",
      viewBox: "0 0 23 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M7 1h13a2 2 0 012 2v11a2 2 0 01-2 2H7l-6-7.5L7 1z",
      fill: "none",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 5l7 7M17 5l-7 7",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinecap: "round"
    })),
    ret: /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "14",
      viewBox: "0 0 20 14"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M18 1v6H4m0 0l4-4M4 7l4 4",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }))
  };
  const key = (content, {
    w,
    flex,
    ret,
    fs = 25,
    k
  } = {}) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      height: 42,
      borderRadius: 8.5,
      flex: flex ? 1 : undefined,
      width: w,
      minWidth: 0,
      background: ret ? '#08f' : keyBg,
      boxShadow: '0 1px 0 rgba(0,0,0,0.075)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, "SF Compact", system-ui',
      fontSize: fs,
      fontWeight: 458,
      color: ret ? '#fff' : glyph
    }
  }, content);
  const row = (keys, pad = 0) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      justifyContent: 'center',
      padding: `0 ${pad}px`
    }
  }, keys.map(l => key(l, {
    flex: true,
    k: l
  })));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 15,
      borderRadius: 27,
      overflow: 'hidden',
      padding: '11px 0 2px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: dark ? '0 -2px 20px rgba(0,0,0,0.09)' : '0 -1px 6px rgba(0,0,0,0.018), 0 -3px 20px rgba(0,0,0,0.012)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.14)' : 'rgba(255,255,255,0.25)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      padding: '8px 22px 13px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, ['"The"', 'the', 'to'].map((w, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 25,
      background: '#ccc',
      opacity: 0.3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      color: sugg,
      letterSpacing: -0.43,
      lineHeight: '22px'
    }
  }, w)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13,
      padding: '0 6.5px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, row(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']), row(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], 20), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14.25,
      alignItems: 'center'
    }
  }, key(icons.shift, {
    w: 45,
    k: 'shift'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      flex: 1
    }
  }, ['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(l => key(l, {
    flex: true,
    k: l
  }))), key(icons.del, {
    w: 45,
    k: 'del'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, key('ABC', {
    w: 92.25,
    fs: 18,
    k: 'abc'
  }), key('', {
    flex: true,
    k: 'space'
  }), key(icons.ret, {
    w: 92.25,
    ret: true,
    k: 'ret'
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 56,
      width: '100%',
      position: 'relative'
    }
  }));
}
Object.assign(window, {
  IOSDevice,
  IOSStatusBar,
  IOSNavBar,
  IOSGlassPill,
  IOSList,
  IOSListRow,
  IOSKeyboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile-operator/ios-frame.jsx", error: String((e && e.message) || e) }); }

// ui_kits/notifications/app.jsx
try { (() => {
/* Notifications — what pings the operator, and the delivery rules.
   Two phones: a lock screen with approval pings, and notification settings. */
const {
  useState: useNotifState
} = React;
function AppIcon({
  size = 26
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      borderRadius: size * 0.27,
      background: 'var(--gradient-brand)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontWeight: 700,
      fontSize: size * 0.46,
      flexShrink: 0
    }
  }, "V+");
}
const NOTIFS = [{
  id: 1,
  critical: true,
  when: 'now',
  title: 'Payout approval needed',
  body: '$9,420 across 24 payouts is ready to release. Reconciliation is clean.',
  tag: 'Money'
}, {
  id: 2,
  critical: true,
  when: '8m ago',
  title: 'Insurance expired',
  body: 'East Side Works\u2019 certificate lapsed. Suspend the listing until renewed?',
  tag: 'Legal'
}, {
  id: 3,
  critical: false,
  when: '9m ago',
  title: 'New listing ready to go live',
  body: 'The Cathedral Hall (Austin) passed all checks — review & publish.',
  tag: null
}, {
  id: 4,
  critical: false,
  when: '12m ago',
  title: '2 cold emails ready to send',
  body: 'Top-scoring outreach drafts for new Austin venue leads.',
  tag: null
}];
function LockScreen() {
  const [items, setItems] = useNotifState(NOTIFS);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      position: 'relative',
      background: 'linear-gradient(165deg, #0a2139 0%, #103156 45%, #5e240d 100%)',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      color: '#fff',
      marginTop: 58
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 13,
      opacity: 0.85,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "5",
    y: "11",
    width: "14",
    height: "10",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 11V7a4 4 0 0 1 8 0v4"
  })), "Monday, June 22"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 72,
      fontWeight: 300,
      lineHeight: 1,
      letterSpacing: '-.02em'
    }
  }, "9:41")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      padding: '0 12px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 6px 2px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(255,255,255,.85)',
      fontSize: 12.5,
      fontWeight: 600
    }
  }, "Notification Center"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 700,
      background: 'var(--accent-500)',
      borderRadius: 999,
      padding: '2px 9px'
    }
  }, items.filter(n => n.critical).length, " need approval")), items.map(n => /*#__PURE__*/React.createElement("div", {
    key: n.id,
    onClick: () => setItems(l => l.filter(x => x.id !== n.id)),
    style: {
      background: 'rgba(255,255,255,0.16)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: n.critical ? '1px solid rgba(255,105,70,0.5)' : '1px solid rgba(255,255,255,0.18)',
      borderRadius: 18,
      padding: 12,
      display: 'flex',
      gap: 10,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(AppIcon, null), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: '#fff',
      textTransform: 'uppercase',
      letterSpacing: '.03em',
      flex: 1
    }
  }, "VenuePlus"), n.tag && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9.5,
      fontWeight: 700,
      color: '#fff',
      background: n.tag === 'Money' ? 'var(--risk-money-fg)' : 'var(--risk-legal-fg)',
      borderRadius: 999,
      padding: '1px 7px'
    }
  }, n.tag), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'rgba(255,255,255,.6)'
    }
  }, n.when)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: '#fff',
      marginTop: 2
    }
  }, n.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'rgba(255,255,255,.82)',
      marginTop: 1,
      lineHeight: 1.35
    }
  }, n.body)))), items.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      color: 'rgba(255,255,255,.7)',
      fontSize: 13,
      padding: '20px 0'
    }
  }, "All caught up \u2713")));
}

/* ---------------- Settings ---------------- */
const DELIVERY = [{
  id: 'critical',
  label: 'Money & legal',
  sub: 'Payouts, refunds, suspensions',
  value: 'push',
  locked: true,
  tone: 'var(--risk-money-fg)'
}, {
  id: 'financial',
  label: 'Financial',
  sub: 'Paid dispatches, credits',
  value: 'push',
  tone: 'var(--risk-financial-fg)'
}, {
  id: 'outbound',
  label: 'Outbound & customer-facing',
  sub: 'Emails, posts, listings, replies',
  value: 'push',
  tone: 'var(--risk-outbound-fg)'
}, {
  id: 'internal',
  label: 'Internal & read-only',
  sub: 'Drafts, scoring, scans',
  value: 'silent',
  tone: 'var(--neutral-500)'
}];
const OPTS = [['push', 'Push'], ['digest', 'Digest'], ['silent', 'Silent']];
function SettingsScreen() {
  const [rows, setRows] = useNotifState(DELIVERY);
  const [quiet, setQuiet] = useNotifState(true);
  const setVal = (id, v) => setRows(l => l.map(r => r.id === id ? {
    ...r,
    value: v
  } : r));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      background: 'var(--neutral-50)',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '52px 18px 8px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 26,
      fontWeight: 800
    }
  }, "Notifications"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontSize: 13.5,
      color: 'var(--text-muted)'
    }
  }, "Choose what reaches you, and when.")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 14px 8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '.05em',
      textTransform: 'uppercase',
      color: 'var(--text-subtle)',
      margin: '0 4px 8px'
    }
  }, "Alert me by risk"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 16,
      border: '1px solid var(--border-default)',
      overflow: 'hidden'
    }
  }, rows.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    style: {
      padding: '12px 14px',
      borderTop: i ? '1px solid var(--border-hairline)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 9
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: r.tone,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--neutral-800)'
    }
  }, r.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--text-subtle)'
    }
  }, r.sub)), r.locked && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: 'var(--risk-money-fg)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "5",
    y: "11",
    width: "14",
    height: "10",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 11V7a4 4 0 0 1 8 0v4"
  })), "CRITICAL")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      background: 'var(--neutral-100)',
      borderRadius: 999,
      padding: 2
    }
  }, OPTS.map(([v, lbl]) => {
    const on = r.value === v;
    return /*#__PURE__*/React.createElement("button", {
      key: v,
      disabled: r.locked,
      onClick: () => !r.locked && setVal(r.id, v),
      style: {
        flex: 1,
        border: 'none',
        cursor: r.locked ? 'default' : 'pointer',
        borderRadius: 999,
        padding: '6px 0',
        fontSize: 12.5,
        fontWeight: 600,
        fontFamily: 'var(--font-sans)',
        background: on ? '#fff' : 'transparent',
        color: on ? 'var(--primary-600)' : 'var(--text-muted)',
        boxShadow: on ? 'var(--shadow-sm)' : 'none',
        opacity: r.locked && !on ? 0.4 : 1
      }
    }, lbl);
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '.05em',
      textTransform: 'uppercase',
      color: 'var(--text-subtle)',
      margin: '18px 4px 8px'
    }
  }, "Quiet hours"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 16,
      border: '1px solid var(--border-default)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '13px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600
    }
  }, "Quiet hours"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--text-subtle)'
    }
  }, "10 PM \u2013 7 AM \xB7 mute non-critical")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setQuiet(q => !q),
    style: {
      width: 46,
      height: 28,
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: quiet ? 'var(--primary-500)' : 'var(--neutral-300)',
      position: 'relative',
      transition: 'background 150ms'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 3,
      left: quiet ? 21 : 3,
      width: 22,
      height: 22,
      borderRadius: '50%',
      background: '#fff',
      transition: 'left 150ms',
      boxShadow: 'var(--shadow-sm)'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '11px 14px',
      borderTop: '1px solid var(--border-hairline)',
      fontSize: 12.5,
      color: 'var(--neutral-600)',
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--risk-money-fg)'
    }
  }, "\u26A0"), " Critical money & legal alerts always break through."))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 40
    }
  }));
}
function Phone({
  label,
  dark,
  children
}) {
  const {
    IOSDevice
  } = window;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--text-muted)'
    }
  }, label), /*#__PURE__*/React.createElement(IOSDevice, {
    dark: dark
  }, children));
}
function Root() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: '100%',
      minHeight: '100vh',
      boxSizing: 'border-box',
      padding: 40,
      background: 'var(--neutral-100)',
      display: 'flex',
      gap: 44,
      justifyContent: 'center',
      alignItems: 'flex-start',
      width: 'max-content'
    }
  }, /*#__PURE__*/React.createElement(Phone, {
    label: "Lock screen \u2014 approval pings",
    dark: true
  }, /*#__PURE__*/React.createElement(LockScreen, null)), /*#__PURE__*/React.createElement(Phone, {
    label: "Notification settings"
  }, /*#__PURE__*/React.createElement(SettingsScreen, null)));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(Root, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/notifications/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/onboarding/app.jsx
try { (() => {
/* Onboarding — root flow: choose persona → guided wizard → submitted. */
const {
  useState: useFlowState
} = React;
function OnboardApp() {
  const {
    Button
  } = window.VenuePlusDesignSystem_17f1a7;
  const [phase, setPhase] = useFlowState('choose'); // choose | flow | done
  const [persona, setPersona] = useFlowState(null); // lister | provider
  const [step, setStep] = useFlowState(0);
  const [data, setData] = useFlowState({});
  const steps = persona === 'lister' ? window.LISTER_STEPS : window.PROVIDER_STEPS;
  const set = (k, v) => setData(d => ({
    ...d,
    [k]: v
  }));
  const reset = () => {
    setData({});
    setStep(0);
    setPersona(null);
    setPhase('choose');
  };
  const start = p => {
    setPersona(p);
    setStep(0);
    setData({});
    setPhase('flow');
  };
  const isLast = step === steps.length - 1;
  const next = () => {
    if (isLast) {
      setPhase('done');
      window.scrollTo(0, 0);
    } else {
      setStep(s => s + 1);
    }
  };
  const back = () => {
    if (step === 0) {
      reset();
    } else {
      setStep(s => s - 1);
    }
  };
  const title = persona === 'lister' ? 'List your space' : persona === 'provider' ? 'Join as a service provider' : 'Get started with VenuePlus';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      background: 'var(--surface-console)',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      background: '#fff',
      borderBottom: '1px solid var(--border-default)',
      padding: '14px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/venueplus-logo-mark.png",
    alt: "VenuePlus",
    style: {
      height: 34
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 17,
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--primary-500)'
    }
  }, "Venue"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent-500)'
    }
  }, "Plus"))), phase === 'flow' && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)'
    }
  }, "Step ", step + 1, " of ", steps.length), phase !== 'choose' && /*#__PURE__*/React.createElement("button", {
    onClick: reset,
    style: {
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      color: 'var(--text-muted)',
      fontSize: 13.5,
      fontFamily: 'var(--font-sans)'
    }
  }, "Exit")), phase === 'choose' && /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 760,
      margin: '0 auto',
      padding: '48px 24px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '0 0 8px',
      fontSize: 32,
      fontWeight: 800,
      letterSpacing: '-.02em',
      textAlign: 'center'
    }
  }, "Turn your space or service into income"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 36px',
      fontSize: 17,
      color: 'var(--text-muted)',
      textAlign: 'center'
    }
  }, "Tell us what you offer. Our Onboarding agent guides the rest \u2014 drafting copy, suggesting pricing, and getting you live fast."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(ChoiceCard, {
    title: "List a space",
    accent: "var(--primary-500)",
    desc: "Rent your venue out by the hour \u2014 rooftops, warehouses, fields, halls, and more.",
    points: ['Set your own hourly rate', 'AI-suggested pricing from local comps', 'Security, cleaning & insurance auto-bundled'],
    onClick: () => start('lister')
  }), /*#__PURE__*/React.createElement(ChoiceCard, {
    title: "Offer a service",
    accent: "var(--accent-500)",
    desc: "Get matched to events that need you \u2014 cleaning, security, catering, DJs, and more.",
    points: ['Choose your service area & radius', 'Auto-matched to nearby bookings', 'Verified badge once approved'],
    onClick: () => start('provider')
  }))), phase === 'flow' && /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 980,
      margin: '0 auto',
      padding: '28px 24px 64px',
      display: 'grid',
      gridTemplateColumns: '1fr 320px',
      gap: 32,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Stepper, {
    steps: steps,
    current: step
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: 28,
      boxShadow: 'var(--shadow-sm)'
    }
  }, steps[step].render({
    d: data,
    set
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: back
  }, step === 0 ? '← Back' : '← Previous'), /*#__PURE__*/React.createElement(Button, {
    variant: isLast ? 'accent' : 'primary',
    onClick: next
  }, isLast ? persona === 'lister' ? 'Publish listing' : 'Submit for review' : 'Continue →'))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      top: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '.05em',
      textTransform: 'uppercase',
      color: 'var(--text-subtle)',
      marginBottom: 10
    }
  }, "Live preview"), persona === 'lister' ? /*#__PURE__*/React.createElement(VenuePreview, {
    d: data
  }) : /*#__PURE__*/React.createElement(ProviderPreview, {
    d: data
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      fontSize: 12.5,
      color: 'var(--text-muted)',
      lineHeight: 1.5,
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--primary-500)'
    }
  }, "\u2726"), /*#__PURE__*/React.createElement("span", null, "Your Onboarding agent fills gaps, checks completeness, and prepares this for the operator\u2019s quick approval.")))), phase === 'done' && /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 560,
      margin: '0 auto',
      padding: '56px 24px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 68,
      height: 68,
      borderRadius: '50%',
      background: 'var(--status-success-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 18px',
      fontSize: 32,
      color: 'var(--status-success-fg)'
    }
  }, "\u2713"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '0 0 8px',
      fontSize: 26,
      fontWeight: 800
    }
  }, persona === 'lister' ? 'Listing submitted!' : 'Profile submitted!'), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 24px',
      fontSize: 15.5,
      color: 'var(--text-muted)',
      lineHeight: 1.5
    }
  }, persona === 'lister' ? 'Your Onboarding agent has prepared the listing. It goes to the operator for a quick approval, then it’s live and bookable.' : 'Your Trust & Safety check is running now. Once your license and insurance are verified and approved, you’ll start getting matched to nearby bookings.'), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 320,
      margin: '0 auto 24px'
    }
  }, persona === 'lister' ? /*#__PURE__*/React.createElement(VenuePreview, {
    d: data
  }) : /*#__PURE__*/React.createElement(ProviderPreview, {
    d: data
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: 16,
      textAlign: 'left',
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '.05em',
      textTransform: 'uppercase',
      color: 'var(--text-subtle)',
      marginBottom: 10
    }
  }, "What happens next"), (persona === 'lister' ? [['✦', 'Onboarding agent finalizes your profile & pricing'], ['⛨', 'Trust & Safety verifies photos & insurance'], ['✓', 'Operator approves — you go live']] : [['⛨', 'Trust & Safety verifies license & insurance'], ['✦', 'Provider Network adds you to coverage'], ['✓', 'Operator approves — you start matching']]).map(([icon, t], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      padding: '6px 0',
      fontSize: 14,
      color: 'var(--neutral-700)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 24,
      height: 24,
      borderRadius: '50%',
      background: 'var(--primary-50)',
      color: 'var(--primary-600)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      flexShrink: 0
    }
  }, icon), t))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    onClick: reset
  }, "List something else"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: reset
  }, "Done"))));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(OnboardApp, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/onboarding/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/onboarding/listerSteps.jsx
try { (() => {
/* Onboarding — venue host (property lister) steps. */
const VENUE_TYPES = ['rooftop', 'warehouse', 'field', 'hall', 'pool house', 'parking lot', 'garden', 'studio', 'loft', 'barn'];
const AMENITIES = ['Parking', 'Restrooms', 'Kitchen', 'WiFi', 'A/V system', 'Tables & chairs', 'Stage', 'Outdoor space', 'Heating / AC', 'Loading dock'];
function Chips({
  options,
  value = [],
  onToggle
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8
    }
  }, options.map(o => {
    const on = value.includes(o);
    return /*#__PURE__*/React.createElement("button", {
      key: o,
      onClick: () => onToggle(o),
      style: {
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        fontSize: 13,
        fontWeight: 500,
        padding: '7px 13px',
        borderRadius: 'var(--radius-full)',
        border: `1px solid ${on ? 'var(--primary-500)' : 'var(--border-strong)'}`,
        background: on ? 'var(--primary-50)' : '#fff',
        color: on ? 'var(--primary-700)' : 'var(--neutral-600)'
      }
    }, on ? '✓ ' : '', o);
  }));
}
function PhotoGrid() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 10
    }
  }, [0, 1, 2, 3, 4, 5].map(i => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      aspectRatio: '4 / 3',
      borderRadius: 'var(--radius-md)',
      border: '2px dashed var(--border-strong)',
      background: i === 0 ? 'var(--primary-50)' : 'var(--neutral-50)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      cursor: 'pointer',
      color: 'var(--text-subtle)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22,
      color: i === 0 ? 'var(--primary-400)' : 'var(--neutral-300)'
    }
  }, "+"), i === 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--primary-600)'
    }
  }, "Cover photo"))));
}
window.LISTER_STEPS = [{
  id: 'basics',
  label: 'Basics',
  render: ({
    d,
    set
  }) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 4px',
      fontSize: 22,
      fontWeight: 800
    }
  }, "Tell us about your space"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 20px',
      fontSize: 14.5,
      color: 'var(--text-muted)'
    }
  }, "The essentials renters search by."), /*#__PURE__*/React.createElement(Field, {
    label: "Space name"
  }, /*#__PURE__*/React.createElement("input", {
    style: window.OB_INPUT,
    value: d.name || '',
    placeholder: "e.g. Skyline Rooftop Loft",
    onChange: e => set('name', e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Space type"
  }, /*#__PURE__*/React.createElement("select", {
    style: {
      ...window.OB_INPUT,
      appearance: 'none'
    },
    value: d.type || '',
    onChange: e => set('type', e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, "Choose a type\u2026"), VENUE_TYPES.map(t => /*#__PURE__*/React.createElement("option", {
    key: t,
    value: t
  }, t[0].toUpperCase() + t.slice(1))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "City"
  }, /*#__PURE__*/React.createElement("input", {
    style: window.OB_INPUT,
    value: d.city || '',
    placeholder: "Austin",
    onChange: e => set('city', e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "State"
  }, /*#__PURE__*/React.createElement("input", {
    style: window.OB_INPUT,
    value: d.state || '',
    placeholder: "TX",
    onChange: e => set('state', e.target.value)
  }))))
}, {
  id: 'details',
  label: 'Details',
  render: ({
    d,
    set
  }) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 4px',
      fontSize: 22,
      fontWeight: 800
    }
  }, "Space details"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 20px',
      fontSize: 14.5,
      color: 'var(--text-muted)'
    }
  }, "Capacity, amenities, and the pitch."), /*#__PURE__*/React.createElement(Field, {
    label: "Maximum capacity (guests)"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    style: window.OB_INPUT,
    value: d.capacity || '',
    placeholder: "80",
    onChange: e => set('capacity', e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Amenities"
  }, /*#__PURE__*/React.createElement(Chips, {
    options: AMENITIES,
    value: d.amenities || [],
    onToggle: a => set('amenities', (d.amenities || []).includes(a) ? d.amenities.filter(x => x !== a) : [...(d.amenities || []), a])
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Description"
  }, /*#__PURE__*/React.createElement("textarea", {
    style: {
      ...window.OB_INPUT,
      minHeight: 96,
      resize: 'vertical'
    },
    value: d.description || '',
    placeholder: "Describe the vibe, the views, what makes it special\u2026",
    onChange: e => set('description', e.target.value)
  })), /*#__PURE__*/React.createElement(AIAssist, {
    action: /*#__PURE__*/React.createElement("button", {
      onClick: () => set('description', `A standout ${d.type || 'space'} in ${d.city || 'town'} with room for up to ${d.capacity || '—'} guests. Flexible by the hour, fully insured, and ready for everything from intimate gatherings to full-scale events.`),
      style: {
        marginTop: 10,
        border: 'none',
        background: 'var(--primary-500)',
        color: '#fff',
        borderRadius: 'var(--radius-md)',
        padding: '8px 14px',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)'
      }
    }, "\u2726 Draft it for me")
  }, "Stuck on wording? I can draft a polished description from your details \u2014 then you edit anything you like."))
}, {
  id: 'photos',
  label: 'Photos',
  render: () => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 4px',
      fontSize: 22,
      fontWeight: 800
    }
  }, "Add photos"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 20px',
      fontSize: 14.5,
      color: 'var(--text-muted)'
    }
  }, "Listings with 5+ photos book 2\xD7 faster. Drag your best shot to the cover slot."), /*#__PURE__*/React.createElement(PhotoGrid, null), /*#__PURE__*/React.createElement(AIAssist, {
    label: "Trust & Safety"
  }, "Photos are auto-checked for quality and to confirm they match your space type before your listing goes live."))
}, {
  id: 'pricing',
  label: 'Pricing',
  render: ({
    d,
    set
  }) => {
    const base = {
      rooftop: 120,
      warehouse: 180,
      field: 90,
      hall: 160,
      'pool house': 110,
      'parking lot': 75
    }[d.type] || 100;
    const suggested = base + Math.round(Number(d.capacity || 0) / 10) * 5;
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
      style: {
        margin: '0 0 4px',
        fontSize: 22,
        fontWeight: 800
      }
    }, "Set your rate"), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '0 0 20px',
        fontSize: 14.5,
        color: 'var(--text-muted)'
      }
    }, "You can change this anytime. VenuePlus adds its fee on top."), /*#__PURE__*/React.createElement(Field, {
      label: "Hourly rate (USD)"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        left: 13,
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--text-muted)',
        fontSize: 15
      }
    }, "$"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      style: {
        ...window.OB_INPUT,
        paddingLeft: 26
      },
      value: d.price || '',
      placeholder: String(suggested),
      onChange: e => set('price', e.target.value)
    }))), /*#__PURE__*/React.createElement(AIAssist, {
      action: /*#__PURE__*/React.createElement("button", {
        onClick: () => set('price', suggested),
        style: {
          marginTop: 10,
          border: 'none',
          background: 'var(--primary-500)',
          color: '#fff',
          borderRadius: 'var(--radius-md)',
          padding: '8px 14px',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)'
        }
      }, "Use $", suggested, "/hr")
    }, "Based on ", /*#__PURE__*/React.createElement("strong", null, "6 similar ", d.type || 'spaces'), " near ", d.city || 'you', ", I suggest ", /*#__PURE__*/React.createElement("strong", null, "$", suggested, "/hr"), " \u2014 competitive while maximizing your bookings."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--neutral-700)',
        marginBottom: 8
      }
    }, "Required services for every booking"), [['security', 'Security', true], ['cleaning', 'Cleaning', true], ['insurance', 'Event insurance', true]].map(([id, label, def]) => /*#__PURE__*/React.createElement("label", {
      key: id,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '7px 0',
        fontSize: 14,
        color: 'var(--neutral-700)'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      defaultChecked: def,
      style: {
        width: 17,
        height: 17,
        accentColor: 'var(--primary-500)'
      }
    }), label, " ", /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: 'var(--text-subtle)'
      }
    }, "\u2014 auto-matched from our provider network")))));
  }
}, {
  id: 'review',
  label: 'Review',
  render: ({
    d
  }) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 4px',
      fontSize: 22,
      fontWeight: 800
    }
  }, "Review & publish"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 20px',
      fontSize: 14.5,
      color: 'var(--text-muted)'
    }
  }, "Here\u2019s what renters will see. Publish to send it for a quick approval."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden'
    }
  }, [['Name', d.name], ['Type', d.type], ['Location', d.city ? `${d.city}, ${d.state || ''}` : ''], ['Capacity', d.capacity ? `${d.capacity} guests` : ''], ['Rate', d.price ? `$${d.price}/hr` : ''], ['Amenities', (d.amenities || []).join(', ')]].map(([k, v], i) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12,
      padding: '11px 14px',
      borderTop: i ? '1px solid var(--border-hairline)' : 'none',
      fontSize: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      color: v ? 'var(--neutral-800)' : 'var(--text-subtle)',
      fontWeight: 500,
      textAlign: 'right',
      textTransform: k === 'Type' ? 'capitalize' : 'none'
    }
  }, v || 'Not set')))))
}];
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/onboarding/listerSteps.jsx", error: String((e && e.message) || e) }); }

// ui_kits/onboarding/providerSteps.jsx
try { (() => {
/* Onboarding — service provider steps. */
const SERVICE_CATS = ['cleaning', 'security', 'catering', 'bartending', 'dj', 'photography', 'decoration', 'equipment', 'staff'];
function CatGrid({
  value,
  onPick
}) {
  const {
    Badge
  } = window.VenuePlusDesignSystem_17f1a7;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 8
    }
  }, SERVICE_CATS.map(c => {
    const on = value === c;
    return /*#__PURE__*/React.createElement("button", {
      key: c,
      onClick: () => onPick(c),
      style: {
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        padding: '12px 8px',
        borderRadius: 'var(--radius-md)',
        border: `2px solid ${on ? 'var(--primary-500)' : 'var(--border-default)'}`,
        background: on ? 'var(--primary-50)' : '#fff',
        display: 'flex',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      category: c
    }));
  }));
}
window.PROVIDER_STEPS = [{
  id: 'business',
  label: 'Business',
  render: ({
    d,
    set
  }) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 4px',
      fontSize: 22,
      fontWeight: 800
    }
  }, "Tell us about your service"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 20px',
      fontSize: 14.5,
      color: 'var(--text-muted)'
    }
  }, "We\u2019ll match you to events that need exactly what you offer."), /*#__PURE__*/React.createElement(Field, {
    label: "Business name"
  }, /*#__PURE__*/React.createElement("input", {
    style: window.OB_INPUT,
    value: d.name || '',
    placeholder: "e.g. Lone Star Event Security",
    onChange: e => set('name', e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "What service do you provide?"
  }, /*#__PURE__*/React.createElement(CatGrid, {
    value: d.category,
    onPick: c => set('category', c)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: 12,
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Service area (city)"
  }, /*#__PURE__*/React.createElement("input", {
    style: window.OB_INPUT,
    value: d.area || '',
    placeholder: "Austin, TX",
    onChange: e => set('area', e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Radius (mi)"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    style: window.OB_INPUT,
    value: d.radius || '',
    placeholder: "25",
    onChange: e => set('radius', e.target.value)
  }))))
}, {
  id: 'coverage',
  label: 'Coverage',
  render: ({
    d,
    set
  }) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 4px',
      fontSize: 22,
      fontWeight: 800
    }
  }, "Capacity & coverage"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 20px',
      fontSize: 14.5,
      color: 'var(--text-muted)'
    }
  }, "How much can you take on?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Team size"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    style: window.OB_INPUT,
    value: d.team || '',
    placeholder: "6",
    onChange: e => set('team', e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Max simultaneous jobs"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    style: window.OB_INPUT,
    value: d.maxJobs || '',
    placeholder: "3",
    onChange: e => set('maxJobs', e.target.value)
  }))), /*#__PURE__*/React.createElement(Field, {
    label: "What you offer"
  }, /*#__PURE__*/React.createElement("textarea", {
    style: {
      ...window.OB_INPUT,
      minHeight: 90,
      resize: 'vertical'
    },
    value: d.description || '',
    placeholder: "Describe your service, experience, and what sets you apart\u2026",
    onChange: e => set('description', e.target.value)
  })), /*#__PURE__*/React.createElement(AIAssist, {
    action: /*#__PURE__*/React.createElement("button", {
      onClick: () => set('description', `Licensed, insured ${d.category || 'event'} professionals serving ${d.area || 'the area'}. ${d.team || 'Our'}-person team with a track record of reliable, on-time service for events of every size.`),
      style: {
        marginTop: 10,
        border: 'none',
        background: 'var(--primary-500)',
        color: '#fff',
        borderRadius: 'var(--radius-md)',
        padding: '8px 14px',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)'
      }
    }, "\u2726 Draft it for me")
  }, "I can write a strong service summary from your details \u2014 edit anything before it goes live."))
}, {
  id: 'credentials',
  label: 'Credentials',
  render: ({
    d,
    set
  }) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 4px',
      fontSize: 22,
      fontWeight: 800
    }
  }, "Licensing & insurance"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 20px',
      fontSize: 14.5,
      color: 'var(--text-muted)'
    }
  }, "Required to keep the marketplace safe. Verified before your first job."), /*#__PURE__*/React.createElement(Field, {
    label: "Business license #"
  }, /*#__PURE__*/React.createElement("input", {
    style: window.OB_INPUT,
    value: d.license || '',
    placeholder: "TX-000000000",
    onChange: e => set('license', e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Proof of insurance"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => set('insured', !d.insured),
    style: {
      width: '100%',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      padding: '16px',
      borderRadius: 'var(--radius-md)',
      border: `2px dashed ${d.insured ? 'var(--status-success-fg)' : 'var(--border-strong)'}`,
      background: d.insured ? 'var(--status-success-bg)' : 'var(--neutral-50)',
      color: d.insured ? 'var(--status-success-fg)' : 'var(--text-muted)',
      fontSize: 13.5,
      fontWeight: 600
    }
  }, d.insured ? '✓ certificate_of_insurance.pdf uploaded' : '+ Upload insurance certificate (PDF)')), /*#__PURE__*/React.createElement(AIAssist, {
    label: "Trust & Safety"
  }, "Your license and insurance certificate are validated automatically. A flagged or expired document is escalated to the operator before you can take jobs \u2014 this protects every booking."))
}, {
  id: 'pricing',
  label: 'Pricing',
  render: ({
    d,
    set
  }) => {
    const base = {
      security: 55,
      cleaning: 40,
      catering: 75,
      bartending: 50,
      dj: 75,
      photography: 90,
      decoration: 45,
      equipment: 35,
      staff: 30
    }[d.category] || 50;
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
      style: {
        margin: '0 0 4px',
        fontSize: 22,
        fontWeight: 800
      }
    }, "Set your rate"), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '0 0 20px',
        fontSize: 14.5,
        color: 'var(--text-muted)'
      }
    }, "What you charge per hour. Change it anytime."), /*#__PURE__*/React.createElement(Field, {
      label: "Hourly rate (USD)"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        left: 13,
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--text-muted)',
        fontSize: 15
      }
    }, "$"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      style: {
        ...window.OB_INPUT,
        paddingLeft: 26
      },
      value: d.rate || '',
      placeholder: String(base),
      onChange: e => set('rate', e.target.value)
    }))), /*#__PURE__*/React.createElement(AIAssist, {
      action: /*#__PURE__*/React.createElement("button", {
        onClick: () => set('rate', base),
        style: {
          marginTop: 10,
          border: 'none',
          background: 'var(--primary-500)',
          color: '#fff',
          borderRadius: 'var(--radius-md)',
          padding: '8px 14px',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)'
        }
      }, "Use $", base, "/hr")
    }, d.category ? /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, d.category[0].toUpperCase() + d.category.slice(1)), " providers in ", d.area || 'your area', " typically charge around ", /*#__PURE__*/React.createElement("strong", null, "$", base, "/hr"), ".") : 'Pick a service category and I’ll suggest a competitive rate.'));
  }
}, {
  id: 'review',
  label: 'Review',
  render: ({
    d
  }) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 4px',
      fontSize: 22,
      fontWeight: 800
    }
  }, "Review & submit"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 20px',
      fontSize: 14.5,
      color: 'var(--text-muted)'
    }
  }, "Submit to send your profile for verification & a quick approval."), /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden'
    }
  }, [['Business', d.name], ['Service', d.category], ['Area', d.area ? `${d.area}${d.radius ? ` · ${d.radius} mi` : ''}` : ''], ['Team', d.team ? `${d.team} people` : ''], ['Rate', d.rate ? `$${d.rate}/hr` : ''], ['Insurance', d.insured ? 'Uploaded' : 'Missing']].map(([k, v], i) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12,
      padding: '11px 14px',
      borderTop: i ? '1px solid var(--border-hairline)' : 'none',
      fontSize: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      color: v ? 'var(--neutral-800)' : 'var(--text-subtle)',
      fontWeight: 500,
      textAlign: 'right',
      textTransform: k === 'Service' ? 'capitalize' : 'none'
    }
  }, v || 'Not set')))))
}];
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/onboarding/providerSteps.jsx", error: String((e && e.message) || e) }); }

// ui_kits/onboarding/shared.jsx
try { (() => {
/* Onboarding — shared UI: stepper, AI-assist callout, choice cards, live previews. */
const {
  useState: useObState
} = React;
function Stepper({
  steps,
  current
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      marginBottom: 24
    }
  }, steps.map((s, i) => {
    const done = i < current,
      on = i === current;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: s.id
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 28,
        height: 28,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        fontWeight: 700,
        background: done ? 'var(--primary-500)' : on ? 'var(--primary-50)' : 'var(--neutral-100)',
        color: done ? '#fff' : on ? 'var(--primary-700)' : 'var(--text-subtle)',
        border: on ? '2px solid var(--primary-500)' : '2px solid transparent'
      }
    }, done ? '✓' : i + 1), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: on ? 600 : 500,
        color: on ? 'var(--primary-700)' : 'var(--text-subtle)',
        whiteSpace: 'nowrap'
      }
    }, s.label)), i < steps.length - 1 && /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 2,
        background: done ? 'var(--primary-300)' : 'var(--border-default)',
        margin: '0 8px',
        marginBottom: 22
      }
    }));
  }));
}
function AIAssist({
  children,
  label = 'Onboarding agent',
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--primary-50)',
      border: '1px solid var(--primary-100)',
      borderRadius: 'var(--radius-lg)',
      padding: '12px 14px',
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 18,
      height: 18,
      borderRadius: '50%',
      background: 'var(--gradient-brand)',
      color: '#fff',
      fontSize: 11
    }
  }, "\u2726"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--primary-700)'
    }
  }, label)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: 'var(--neutral-700)',
      lineHeight: 1.5
    }
  }, children), action);
}
function Field({
  label,
  hint,
  children
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--neutral-700)',
      marginBottom: 6
    }
  }, label), children, hint && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 12,
      color: 'var(--text-subtle)',
      marginTop: 5
    }
  }, hint));
}
const inputCss = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px 13px',
  fontSize: 14.5,
  fontFamily: 'var(--font-sans)',
  color: 'var(--neutral-900)',
  background: '#fff',
  border: '1px solid var(--neutral-300)',
  borderRadius: 'var(--radius-md)',
  outline: 'none'
};
function ChoiceCard({
  title,
  desc,
  accent,
  points,
  onClick
}) {
  const [hover, setHover] = useObState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      textAlign: 'left',
      cursor: 'pointer',
      background: '#fff',
      fontFamily: 'var(--font-sans)',
      border: `2px solid ${hover ? accent : 'var(--border-default)'}`,
      borderRadius: 'var(--radius-lg)',
      padding: 24,
      transition: 'var(--transition-colors), transform 150ms',
      transform: hover ? 'translateY(-3px)' : 'none',
      boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48,
      height: 48,
      borderRadius: 'var(--radius-md)',
      background: accent,
      opacity: 0.12,
      marginBottom: 14
    }
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 6px',
      fontSize: 20,
      fontWeight: 700,
      color: 'var(--neutral-900)'
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 14px',
      fontSize: 14.5,
      color: 'var(--text-muted)',
      lineHeight: 1.5
    }
  }, desc), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 7
    }
  }, points.map(p => /*#__PURE__*/React.createElement("li", {
    key: p,
    style: {
      display: 'flex',
      gap: 8,
      fontSize: 13.5,
      color: 'var(--neutral-700)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: accent,
      fontWeight: 700
    }
  }, "\u2713"), p))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      fontSize: 14,
      fontWeight: 600,
      color: accent
    }
  }, "Get started \u2192"));
}

/* live preview cards */
function VenuePreview({
  d
}) {
  const grad = 'linear-gradient(135deg, var(--primary-500), var(--accent-500))';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-md)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 150,
      background: grad,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(255,255,255,.5)',
      fontSize: 38,
      fontWeight: 700
    }
  }, "V+"), d.type && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 10,
      left: 10,
      background: 'rgba(255,255,255,.92)',
      color: 'var(--neutral-800)',
      fontSize: 11,
      fontWeight: 600,
      padding: '3px 9px',
      borderRadius: 999,
      textTransform: 'capitalize'
    }
  }, d.type)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: 0,
      fontSize: 16,
      fontWeight: 700,
      color: d.name ? 'var(--neutral-900)' : 'var(--text-subtle)'
    }
  }, d.name || 'Your space name'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)',
      marginTop: 3
    }
  }, "\u25CC ", d.city || 'City', ", ", d.state || '—'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTop: '1px solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--neutral-600)'
    }
  }, d.capacity ? `Up to ${d.capacity}` : 'Capacity'), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: 'var(--primary-600)'
    }
  }, d.price ? `$${d.price}` : '$—', /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-subtle)',
      fontWeight: 400,
      fontSize: 12
    }
  }, "/hr")))));
}
function ProviderPreview({
  d
}) {
  const {
    Badge
  } = window.VenuePlusDesignSystem_17f1a7;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-md)',
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      borderRadius: 'var(--radius-md)',
      background: 'var(--gradient-brand)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontWeight: 700,
      fontSize: 18
    }
  }, (d.name || 'P')[0].toUpperCase()), d.category && /*#__PURE__*/React.createElement(Badge, {
    category: d.category
  })), /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: 0,
      fontSize: 16,
      fontWeight: 700,
      color: d.name ? 'var(--neutral-900)' : 'var(--text-subtle)'
    }
  }, d.name || 'Your business name'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)',
      marginTop: 3
    }
  }, "\u25CC ", d.area || 'Service area', d.radius ? ` · ${d.radius} mi` : ''), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTop: '1px solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--neutral-600)'
    }
  }, d.insured ? '⛨ Insured' : 'Add insurance'), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: 'var(--primary-600)'
    }
  }, d.rate ? `$${d.rate}` : '$—', /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-subtle)',
      fontWeight: 400,
      fontSize: 12
    }
  }, "/hr"))));
}
Object.assign(window, {
  Stepper,
  AIAssist,
  Field,
  ChoiceCard,
  VenuePreview,
  ProviderPreview,
  OB_INPUT: inputCss
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/onboarding/shared.jsx", error: String((e && e.message) || e) }); }

// ui_kits/operator-launch/app.jsx
try { (() => {
/* Day-one operator — empty state + supply bootstrap.
   Strategy: scrape service providers first (easy-to-find SMBs with ad channels);
   once coverage exists, venue owners list more readily because the services
   they'd require from renters are already in place. */
const {
  useState: useLaunchState,
  useEffect: useLaunchEffect,
  useRef: useLaunchRef
} = React;
const CATS = ['security', 'cleaning', 'catering', 'bartending', 'dj', 'photography', 'equipment', 'staff'];
const FACTOR = {
  security: 1.0,
  cleaning: 1.15,
  catering: 0.9,
  bartending: 0.8,
  dj: 0.72,
  photography: 0.95,
  equipment: 0.85,
  staff: 1.05
};
function ZeroKpi({
  label,
  value,
  sub,
  accent
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 26,
      fontWeight: 800,
      color: accent || 'var(--neutral-300)',
      lineHeight: 1.1,
      marginTop: 2
    }
  }, value), sub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--text-subtle)',
      marginTop: 3
    }
  }, sub));
}
function PhaseCard({
  n,
  active,
  done,
  title,
  body,
  points,
  accent
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: '#fff',
      border: `1px solid ${active ? accent : 'var(--border-default)'}`,
      borderTop: `3px solid ${accent}`,
      borderRadius: 'var(--radius-lg)',
      padding: 18,
      opacity: done ? 0.6 : 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 24,
      height: 24,
      borderRadius: '50%',
      background: accent,
      color: '#fff',
      fontSize: 13,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, done ? '✓' : n), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 16,
      fontWeight: 700
    }
  }, title), active && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontSize: 11,
      fontWeight: 700,
      color: accent,
      textTransform: 'uppercase',
      letterSpacing: '.04em'
    }
  }, "Active")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 10px',
      fontSize: 13.5,
      color: 'var(--neutral-600)',
      lineHeight: 1.5
    }
  }, body), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, points.map(p => /*#__PURE__*/React.createElement("li", {
    key: p,
    style: {
      display: 'flex',
      gap: 8,
      fontSize: 13,
      color: 'var(--neutral-700)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: accent,
      fontWeight: 700
    }
  }, "\u203A"), p))));
}
function LaunchApp() {
  const {
    Button,
    Badge,
    KpiCard
  } = window.VenuePlusDesignSystem_17f1a7;
  const [phase, setPhase] = useLaunchState('empty'); // empty | working
  const [city, setCity] = useLaunchState('Austin, TX');
  const [picked, setPicked] = useLaunchState(['security', 'cleaning', 'catering', 'bartending', 'dj']);
  const [p, setP] = useLaunchState(0); // 0..100 progress
  const timer = useLaunchRef(null);
  const launch = () => {
    if (!picked.length) return;
    setPhase('working');
    setP(0);
    window.scrollTo(0, 0);
    timer.current = setInterval(() => setP(v => {
      if (v >= 100) {
        clearInterval(timer.current);
        return 100;
      }
      return v + 2;
    }), 90);
  };
  useLaunchEffect(() => () => clearInterval(timer.current), []);
  const toggleCat = c => setPicked(l => l.includes(c) ? l.filter(x => x !== c) : [...l, c]);
  const found = Math.round(p * 1.18);
  const queued = Math.round(p * 0.62);
  const coverage = Math.min(92, Math.round(p * 0.92));
  const phase2 = coverage >= 60;
  if (phase === 'empty') {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 980,
        margin: '0 auto',
        padding: '28px 24px 64px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--gradient-hero)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 28px',
        color: '#fff',
        marginBottom: 20
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '.06em',
        textTransform: 'uppercase',
        color: 'var(--accent-200)'
      }
    }, "Day 1 \xB7 Solo operator"), /*#__PURE__*/React.createElement("h1", {
      style: {
        margin: '8px 0 6px',
        fontSize: 30,
        fontWeight: 800,
        letterSpacing: '-.02em'
      }
    }, "Let\u2019s bootstrap your marketplace"), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 16,
        color: 'var(--primary-50)',
        maxWidth: '60ch',
        lineHeight: 1.5
      }
    }, "No supply yet \u2014 that\u2019s expected. The fleet builds it for you, supply-first. You just approve the outreach.")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
        marginBottom: 24
      }
    }, /*#__PURE__*/React.createElement(ZeroKpi, {
      label: "Service providers",
      value: "0",
      sub: "Build these first"
    }), /*#__PURE__*/React.createElement(ZeroKpi, {
      label: "Active venues",
      value: "0",
      sub: "Phase 2"
    }), /*#__PURE__*/React.createElement(ZeroKpi, {
      label: "Bookings",
      value: "0"
    }), /*#__PURE__*/React.createElement(ZeroKpi, {
      label: "GMV",
      value: "$0"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '.05em',
        textTransform: 'uppercase',
        color: 'var(--text-subtle)',
        marginBottom: 10
      }
    }, "The launch strategy"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'stretch',
        gap: 14,
        marginBottom: 26
      }
    }, /*#__PURE__*/React.createElement(PhaseCard, {
      n: "1",
      active: true,
      accent: "var(--primary-500)",
      title: "Build service coverage",
      body: "Service providers \u2014 cleaners, security, food trucks, bartenders, insurance \u2014 are SMBs with public listings and ad channels. They\u2019re easy to find, so the fleet scrapes and recruits them first.",
      points: ['Discovery scrapes Places, Yelp & socials', 'Outreach pitches providers to join free', 'Coverage map fills, category by category']
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        color: 'var(--neutral-300)'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "26",
      height: "26",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "9 18 15 12 9 6"
    }))), /*#__PURE__*/React.createElement(PhaseCard, {
      n: "2",
      accent: "var(--accent-500)",
      title: "Venues follow",
      body: "With services already in place, property owners list far more readily \u2014 everything a renter needs (security, cleaning, insurance) is ready on day one, so there\u2019s no friction to going live.",
      points: ['Venue owners pitched on ready-made services', 'Required services auto-attach to each listing', 'First bookings can be fully serviced immediately']
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#fff',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: 22,
        boxShadow: 'var(--shadow-sm)'
      }
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        margin: '0 0 4px',
        fontSize: 18,
        fontWeight: 700
      }
    }, "Launch the supply engine"), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '0 0 16px',
        fontSize: 14,
        color: 'var(--text-muted)'
      }
    }, "Pick a launch city and the provider categories to recruit first."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap',
        alignItems: 'flex-end'
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        flex: '1 1 220px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--neutral-700)',
        marginBottom: 6
      }
    }, "Launch city"), /*#__PURE__*/React.createElement("input", {
      value: city,
      onChange: e => setCity(e.target.value),
      style: {
        width: '100%',
        boxSizing: 'border-box',
        padding: '11px 13px',
        fontSize: 14.5,
        fontFamily: 'var(--font-sans)',
        border: '1px solid var(--neutral-300)',
        borderRadius: 'var(--radius-md)',
        outline: 'none'
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 16
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--neutral-700)',
        marginBottom: 8
      }
    }, "Provider categories (", picked.length, ")"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8
      }
    }, CATS.map(c => {
      const on = picked.includes(c);
      return /*#__PURE__*/React.createElement("button", {
        key: c,
        onClick: () => toggleCat(c),
        style: {
          cursor: 'pointer',
          borderRadius: 'var(--radius-full)',
          border: `1px solid ${on ? 'var(--primary-500)' : 'var(--border-strong)'}`,
          background: on ? 'var(--primary-50)' : '#fff',
          padding: '4px 6px 4px 10px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'var(--font-sans)'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 13,
          color: on ? 'var(--primary-700)' : 'var(--neutral-500)',
          textTransform: 'capitalize'
        }
      }, c), /*#__PURE__*/React.createElement(Badge, {
        category: c
      }));
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "accent",
      size: "lg",
      onClick: launch,
      disabled: !picked.length
    }, "Launch supply engine \u2192"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12.5,
        color: 'var(--text-subtle)'
      }
    }, "Nothing sends until you approve it. Outreach drafts land in your queue."))));
  }

  /* working */
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 980,
      margin: '0 auto',
      padding: '28px 24px 64px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 18,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--status-success-fg)',
      background: 'var(--status-success-bg)',
      padding: '6px 12px',
      borderRadius: 999
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: 'currentColor'
    }
  }), "Supply engine running \xB7 ", city), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)'
    }
  }, p < 100 ? 'Scraping & recruiting providers…' : 'First wave complete.')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 12,
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(KpiCard, {
    label: "Providers found",
    value: found,
    accent: "var(--primary-600)"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Contacted / queued",
    value: queued,
    delta: `${queued} drafts in your queue`,
    deltaTone: "neutral"
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Service coverage",
    value: `${coverage}%`,
    accent: phase2 ? 'var(--status-success-fg)' : 'var(--status-pending-fg)'
  }), /*#__PURE__*/React.createElement(KpiCard, {
    label: "Active venues",
    value: "0",
    delta: phase2 ? 'Phase 2 unlocked →' : `Unlocks at 60%`,
    deltaTone: phase2 ? 'up' : 'neutral'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: 18,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 14px',
      fontSize: 15,
      fontWeight: 700
    }
  }, "Provider pipeline"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, [['Discovery', found], ['Enrichment', Math.round(found * 0.82)], ['Scoring', Math.round(found * 0.78)], ['Outreach', queued]].map(([label, n], i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: label
  }, i > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--neutral-300)'
    }
  }, "\u203A"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      background: 'var(--neutral-50)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 6px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      color: 'var(--primary-600)'
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)'
    }
  }, label)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: 18,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 14px',
      fontSize: 15,
      fontWeight: 700
    }
  }, "Coverage by category \u2014 ", city), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 11
    }
  }, picked.map(c => {
    const pct = Math.min(100, Math.round(p * (FACTOR[c] || 0.9)));
    return /*#__PURE__*/React.createElement("div", {
      key: c,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 110,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      category: c
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 8,
        background: 'var(--neutral-100)',
        borderRadius: 999,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${pct}%`,
        height: '100%',
        background: pct >= 60 ? 'var(--status-success-fg)' : 'var(--primary-500)',
        borderRadius: 999,
        transition: 'width 120ms linear'
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 38,
        textAlign: 'right',
        fontSize: 12.5,
        fontWeight: 600,
        color: pct >= 60 ? 'var(--status-success-fg)' : 'var(--neutral-600)'
      }
    }, pct, "%"));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: phase2 ? 'var(--accent-50)' : 'var(--neutral-50)',
      border: `1px solid ${phase2 ? 'var(--accent-200)' : 'var(--border-default)'}`,
      borderRadius: 'var(--radius-lg)',
      padding: 18,
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 30,
      height: 30,
      borderRadius: '50%',
      background: phase2 ? 'var(--accent-500)' : 'var(--neutral-300)',
      color: '#fff',
      fontSize: 14,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, "2"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: phase2 ? 'var(--accent-700)' : 'var(--neutral-600)'
    }
  }, phase2 ? 'Phase 2 unlocked — recruiting venues' : 'Phase 2 — venue recruitment'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--neutral-600)',
      marginTop: 2
    }
  }, phase2 ? 'Coverage is strong enough to pitch venue owners on a marketplace where services are already in place. Venue outreach drafts are starting to appear in your queue.' : `Reaches owners once coverage passes 60% (now ${coverage}%). They list more readily when the services they&rsquo;d require are ready.`))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '18px 0 0',
      fontSize: 13,
      color: 'var(--text-muted)',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--neutral-700)'
    }
  }, queued, " outreach drafts"), " are waiting in your approval queue. Approve to start signing providers."));
}
function Root() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      background: 'var(--surface-console)',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      background: '#fff',
      borderBottom: '1px solid var(--border-default)',
      padding: '0 24px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/venueplus-logo-mark.png",
    alt: "VenuePlus",
    style: {
      height: 34
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      lineHeight: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700
    }
  }, "VenuePlus"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      fontWeight: 600,
      letterSpacing: '.06em',
      textTransform: 'uppercase',
      color: 'var(--primary-600)'
    }
  }, "Mission Control"))), /*#__PURE__*/React.createElement(LaunchApp, null));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(Root, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/operator-launch/app.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.KpiCard = __ds_scope.KpiCard;

})();
