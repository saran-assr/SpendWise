import React from 'react';
import * as Icons from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
  size?: number;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className = 'w-5 h-5', size = 20 }) => {
  // @ts-expect-error dynamic lucide icon lookup
  const Component = Icons[name] || Icons.CircleDollarSign;
  return <Component className={className} size={size} />;
};
