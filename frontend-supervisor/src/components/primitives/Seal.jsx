import React from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, ShieldX } from 'lucide-react';

/**
 * Seal — Semantic lane glyph (DESIGN_SYSTEM.md §6)
 * Replaces plain-text pills with semantic icon + mono label
 */
export const Seal = ({ 
  lane = 'standard', // 'standard' | 'critical' | 'verified' | 'error'
  label, 
  size = 'sm',
  className = '' 
}) => {
  const isCritical = lane === 'critical' || lane === 'QKD' || lane === 'qkd';
  const isVerified = lane === 'verified' || lane === 'valid';
  const isError = lane === 'error' || lane === 'fail' || lane === 'danger';

  let config = {
    icon: ShieldCheck,
    color: 'text-standard border-standard/30 bg-standard/10',
    defaultLabel: 'ML-KEM-768',
  };

  if (isCritical) {
    config = {
      icon: ShieldAlert,
      color: 'text-critical border-critical/35 bg-critical/10',
      defaultLabel: 'BB84 QKD',
    };
  } else if (isVerified) {
    config = {
      icon: CheckCircle2,
      color: 'text-verified border-verified/35 bg-verified/10',
      defaultLabel: 'VALID',
    };
  } else if (isError) {
    config = {
      icon: ShieldX,
      color: 'text-danger border-danger/35 bg-danger/10',
      defaultLabel: 'FAIL',
    };
  }

  const Icon = config.icon;
  const displayLabel = label || config.defaultLabel;
  const iconSize = size === 'xs' ? 10 : 12;

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] border font-mono tracking-wide ${config.color} ${
        size === 'xs' ? 'text-[9px]' : 'text-[10px]'
      } ${className}`}
    >
      <Icon size={iconSize} className="shrink-0" />
      <span>{displayLabel}</span>
    </span>
  );
};

export default Seal;
