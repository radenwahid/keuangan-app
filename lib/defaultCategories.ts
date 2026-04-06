import { Category } from './types';

export function getDefaultCategories(userId: string): Category[] {
  const income = [
    { name: 'Gaji', icon: 'Briefcase', color: '#10B981' },
    { name: 'Freelance', icon: 'Laptop', color: '#3B82F6' },
    { name: 'Bonus', icon: 'Gift', color: '#8B5CF6' },
    { name: 'Investasi', icon: 'TrendingUp', color: '#F59E0B' },
    { name: 'Lainnya', icon: 'Plus', color: '#6B7280' },
  ];
  const expense = [
    { name: 'Makanan', icon: 'UtensilsCrossed', color: '#EF4444' },
    { name: 'Transport', icon: 'Car', color: '#F97316' },
    { name: 'Belanja', icon: 'ShoppingBag', color: '#EC4899' },
    { name: 'Kesehatan', icon: 'Heart', color: '#14B8A6' },
    { name: 'Hiburan', icon: 'Music', color: '#A855F7' },
    { name: 'Tagihan', icon: 'FileText', color: '#64748B' },
    { name: 'Pendidikan', icon: 'BookOpen', color: '#0EA5E9' },
    { name: 'Lainnya', icon: 'MoreHorizontal', color: '#9CA3AF' },
  ];

  const now = new Date().toISOString();
  return [
    ...income.map((c, i) => ({
      id: `default-income-${userId}-${i}`,
      userId,
      name: c.name,
      type: 'income' as const,
      color: c.color,
      icon: c.icon,
      isDefault: true,
    })),
    ...expense.map((c, i) => ({
      id: `default-expense-${userId}-${i}`,
      userId,
      name: c.name,
      type: 'expense' as const,
      color: c.color,
      icon: c.icon,
      isDefault: true,
    })),
  ];
}
