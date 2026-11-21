import React from 'react';
import Seal from '../primitives/Seal';
import { ENCRYPTION_LANES } from '../../utils/constants';

const Badge = ({ variant = ENCRYPTION_LANES.STANDARD, label, className = '' }) => {
  const isQKD = variant === ENCRYPTION_LANES.CRITICAL || variant === 'QKD' || variant === 'qkd';
  return (
    <Seal 
      lane={isQKD ? 'critical' : 'standard'} 
      label={label || (isQKD ? 'BB84 QKD' : 'ML-KEM-768')}
      className={className} 
    />
  );
};

export default Badge;
