import React from 'react';
import {
  Briefcase, Laptop, Gift, TrendingUp, Plus, UtensilsCrossed, Car, ShoppingBag,
  Heart, Music, FileText, BookOpen, MoreHorizontal, Tag, Home, Coffee, Zap,
  Smartphone, Globe, DollarSign, PiggyBank, CreditCard, Wallet,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Briefcase, Laptop, Gift, TrendingUp, Plus, UtensilsCrossed, Car, ShoppingBag,
  Heart, Music, FileText, BookOpen, MoreHorizontal, Tag, Home, Coffee, Zap,
  Smartphone, Globe, DollarSign, PiggyBank, CreditCard, Wallet,
};

export const ICON_OPTIONS = Object.keys(iconMap);

export default function CategoryIcon({ icon, size = 18, className, style }: { icon: string; size?: number; className?: string; style?: React.CSSProperties }) {
  const Icon = iconMap[icon] || Tag;
  return <span style={style} className={className}><Icon size={size} /></span>;
}
