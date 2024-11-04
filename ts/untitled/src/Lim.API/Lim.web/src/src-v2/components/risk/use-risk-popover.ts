import { useMemo, useState } from 'react';

const SHOW_RISK_LEVEL = 1;
const SHOW_BUSINESS_IMPACT = 2;

export function usePopoverManager() {
  const [popoverState, setPopoverState] = useState(null);
  return [
    popoverState,
    useMemo(
      () => ({
        closeAll() {
          setPopoverState(null);
        },
        toggleRiskLevel() {
          setPopoverState(popoverState =>
            popoverState === SHOW_RISK_LEVEL ? null : SHOW_RISK_LEVEL
          );
        },
        toggleBusinessImpact() {
          setPopoverState(popoverState =>
            popoverState === SHOW_BUSINESS_IMPACT ? null : SHOW_BUSINESS_IMPACT
          );
        },
      }),
      [setPopoverState]
    ),
  ];
}
