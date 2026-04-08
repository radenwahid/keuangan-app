'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

export type Locale = 'id' | 'en';

export const translations = {
  id: {
    // Nav
    nav_home: 'Beranda',
    nav_transactions: 'Transaksi',
    nav_categories: 'Kategori',
    nav_templates: 'Template',
    nav_reports: 'Laporan',
    nav_savings: 'Tabungan',
    nav_profile: 'Profil',
    nav_logout: 'Keluar',

    // UserMenu
    menu_view_profile: 'Lihat Profil',
    menu_language: 'Bahasa',

    // Topbar
    topbar_hide_balance: 'Sembunyikan saldo',
    topbar_show_balance: 'Tampilkan saldo',

    // Dashboard
    dashboard_title: 'Beranda',
    dashboard_subtitle: 'Ringkasan keuangan kamu',
    dashboard_total_income: 'Total Pemasukan',
    dashboard_total_expense: 'Total Pengeluaran',
    dashboard_net_balance: 'Saldo Bersih',
    dashboard_cash_balance: 'Saldo Cash',
    dashboard_bank_balance: 'Saldo Bank / E-Wallet',
    dashboard_chart_daily: 'Pemasukan vs Pengeluaran Harian',
    dashboard_chart_category: 'Pengeluaran per Kategori',
    dashboard_recent: 'Transaksi Terbaru',
    dashboard_no_data: 'Belum ada data',
    dashboard_no_expense: 'Belum ada pengeluaran',
    dashboard_no_tx: 'Belum ada transaksi bulan ini',
    dashboard_add_tx: 'Tambah Transaksi',
    dashboard_transfer: 'Transfer',

    // Transactions
    tx_title: 'Transaksi',
    tx_add: 'Tambah',
    tx_transfer: 'Transfer',
    tx_filter_all_type: 'Semua Tipe',
    tx_filter_income: 'Pemasukan',
    tx_filter_expense: 'Pengeluaran',
    tx_filter_transfer: 'Transfer',
    tx_filter_all_cat: 'Semua Kategori',
    tx_filter_all_wallet: 'Semua Dompet',
    tx_wallet_cash: 'Cash',
    tx_wallet_bank: 'Bank / E-Wallet',
    tx_empty: 'Belum ada transaksi',
    tx_select: 'Pilih',
    tx_select_page: 'Pilih halaman ini',
    tx_deselect_all: 'Batal semua',
    tx_all_income: 'Semua Pemasukan',
    tx_all_expense: 'Semua Pengeluaran',
    tx_selected: 'dipilih',
    tx_delete_confirm: 'Hapus transaksi ini?',
    tx_added: 'Transaksi ditambahkan',
    tx_updated: 'Transaksi diperbarui',
    tx_deleted: 'Transaksi dihapus',
    tx_add_fail: 'Gagal menambahkan',
    tx_update_fail: 'Gagal memperbarui',
    tx_delete_fail: 'Gagal menghapus',
    tx_modal_add: 'Tambah Transaksi',
    tx_modal_edit: 'Edit Transaksi',
    tx_modal_transfer: 'Transfer Saldo',
    tx_modal_edit_transfer: 'Edit Transfer',

    // TransactionForm
    form_expense: 'Pengeluaran',
    form_income: 'Pemasukan',
    form_pay_from: 'Bayar dari',
    form_receive_to: 'Masuk ke',
    form_amount: 'Nominal',
    form_category: 'Kategori',
    form_pick_category: 'Pilih kategori',
    form_note: 'Catatan',
    form_optional: 'Opsional',
    form_date: 'Tanggal',
    form_cancel: 'Batal',
    form_save: 'Simpan',
    form_saving: 'Menyimpan...',
    form_load_template: 'Muat dari Template',
    form_close_template: 'Tutup Template',

    // TransferForm
    transfer_from_to: 'Dari → Ke',
    transfer_available: 'tersedia',
    transfer_loading_balance: 'Memuat saldo...',
    transfer_balance_unavailable: 'Saldo tidak tersedia',
    transfer_insufficient: 'Saldo tidak mencukupi. Kurang',
    transfer_same_wallet: 'Dompet asal dan tujuan tidak boleh sama',
    transfer_save_changes: 'Simpan Perubahan',
    transfer_submit: 'Transfer',

    // Categories
    cat_title: 'Kategori',
    cat_add: 'Tambah',
    cat_empty: 'Belum ada kategori',
    cat_name: 'Nama Kategori',
    cat_type: 'Tipe',
    cat_color: 'Warna',
    cat_icon: 'Ikon',
    cat_default: 'Default',
    cat_added: 'Kategori ditambahkan',
    cat_updated: 'Kategori diperbarui',
    cat_deleted: 'Kategori dihapus',
    cat_delete_fail: 'Gagal menghapus',
    cat_modal_add: 'Tambah Kategori',
    cat_modal_edit: 'Edit Kategori',
    cat_delete_confirm: (name: string) => `Hapus kategori "${name}"?`,

    // Templates
    tpl_title: 'Template',
    tpl_add: 'Tambah',
    tpl_empty: 'Belum ada template',
    tpl_empty_sub: 'Buat template untuk mempercepat input transaksi',
    tpl_name: 'Nama Template',
    tpl_type: 'Tipe',
    tpl_amount: 'Nominal',
    tpl_category: 'Kategori',
    tpl_note: 'Catatan',
    tpl_added: 'Template ditambahkan',
    tpl_updated: 'Template diperbarui',
    tpl_deleted: 'Template dihapus',
    tpl_add_fail: 'Gagal menambahkan',
    tpl_update_fail: 'Gagal memperbarui',
    tpl_delete_fail: 'Gagal menghapus',
    tpl_delete_confirm: 'Hapus template ini?',
    tpl_modal_add: 'Tambah Template',
    tpl_modal_edit: 'Edit Template',

    // Reports
    report_title: 'Laporan',
    report_subtitle: 'Analisis keuangan bulanan',
    report_total_income: 'Total Pemasukan',
    report_total_expense: 'Total Pengeluaran',
    report_balance: 'Saldo Bersih',
    report_chart_daily: 'Pemasukan vs Pengeluaran Harian',
    report_chart_category: 'Pengeluaran per Kategori',
    report_all_tx: 'Semua Transaksi',
    report_no_data: 'Belum ada data',
    report_no_expense: 'Belum ada pengeluaran',
    report_no_tx: 'Belum ada transaksi bulan ini',
    report_col_date: 'Tanggal',
    report_col_type: 'Tipe',
    report_col_category: 'Kategori',
    report_col_note: 'Catatan',
    report_col_amount: 'Nominal',

    // Profile
    profile_title: 'Profil',
    profile_subtitle: 'Kelola informasi akun kamu',
    profile_joined: 'Bergabung',
    profile_full_name: 'Nama Lengkap',
    profile_email: 'Email',
    profile_change_password: 'Ganti Password',
    profile_old_password: 'Password Lama',
    profile_new_password: 'Password Baru',
    profile_confirm_password: 'Konfirmasi Password Baru',
    profile_save_password: 'Ubah Password',
    profile_saving: 'Menyimpan...',
    profile_name_updated: 'Nama berhasil diperbarui',
    profile_name_fail: 'Gagal memperbarui nama',
    profile_pw_updated: 'Password berhasil diubah',
    profile_pw_mismatch: 'Konfirmasi password tidak cocok',
    profile_pw_short: 'Password minimal 6 karakter',

    // Notifications
    notif_title: 'Notifikasi',
    notif_new: 'baru',
    notif_delete_all: 'Hapus semua',
    notif_loading: 'Memuat...',
    notif_empty: 'Tidak ada notifikasi',

    // Months
    months: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],

    // Common
    common_income: 'Pemasukan',
    common_expense: 'Pengeluaran',
    common_transfer: 'Transfer',
    common_cash: 'Cash',
    common_bank: 'Bank/E-Wallet',
    common_no_data: 'Belum ada data',
  },

  en: {
    // Nav
    nav_home: 'Home',
    nav_transactions: 'Transactions',
    nav_categories: 'Categories',
    nav_templates: 'Templates',
    nav_reports: 'Reports',
    nav_savings: 'Savings',
    nav_profile: 'Profile',
    nav_logout: 'Logout',

    // UserMenu
    menu_view_profile: 'View Profile',
    menu_language: 'Language',

    // Topbar
    topbar_hide_balance: 'Hide balance',
    topbar_show_balance: 'Show balance',

    // Dashboard
    dashboard_title: 'Home',
    dashboard_subtitle: 'Your financial summary',
    dashboard_total_income: 'Total Income',
    dashboard_total_expense: 'Total Expense',
    dashboard_net_balance: 'Net Balance',
    dashboard_cash_balance: 'Cash Balance',
    dashboard_bank_balance: 'Bank / E-Wallet Balance',
    dashboard_chart_daily: 'Daily Income vs Expense',
    dashboard_chart_category: 'Expense by Category',
    dashboard_recent: 'Recent Transactions',
    dashboard_no_data: 'No data yet',
    dashboard_no_expense: 'No expenses yet',
    dashboard_no_tx: 'No transactions this month',
    dashboard_add_tx: 'Add Transaction',
    dashboard_transfer: 'Transfer',

    // Transactions
    tx_title: 'Transactions',
    tx_add: 'Add',
    tx_transfer: 'Transfer',
    tx_filter_all_type: 'All Types',
    tx_filter_income: 'Income',
    tx_filter_expense: 'Expense',
    tx_filter_transfer: 'Transfer',
    tx_filter_all_cat: 'All Categories',
    tx_filter_all_wallet: 'All Wallets',
    tx_wallet_cash: 'Cash',
    tx_wallet_bank: 'Bank / E-Wallet',
    tx_empty: 'No transactions yet',
    tx_select: 'Select',
    tx_select_page: 'Select this page',
    tx_deselect_all: 'Deselect all',
    tx_all_income: 'All Income',
    tx_all_expense: 'All Expense',
    tx_selected: 'selected',
    tx_delete_confirm: 'Delete this transaction?',
    tx_added: 'Transaction added',
    tx_updated: 'Transaction updated',
    tx_deleted: 'Transaction deleted',
    tx_add_fail: 'Failed to add',
    tx_update_fail: 'Failed to update',
    tx_delete_fail: 'Failed to delete',
    tx_modal_add: 'Add Transaction',
    tx_modal_edit: 'Edit Transaction',
    tx_modal_transfer: 'Transfer Balance',
    tx_modal_edit_transfer: 'Edit Transfer',

    // TransactionForm
    form_expense: 'Expense',
    form_income: 'Income',
    form_pay_from: 'Pay from',
    form_receive_to: 'Receive to',
    form_amount: 'Amount',
    form_category: 'Category',
    form_pick_category: 'Select category',
    form_note: 'Note',
    form_optional: 'Optional',
    form_date: 'Date',
    form_cancel: 'Cancel',
    form_save: 'Save',
    form_saving: 'Saving...',
    form_load_template: 'Load from Template',
    form_close_template: 'Close Templates',

    // TransferForm
    transfer_from_to: 'From → To',
    transfer_available: 'available',
    transfer_loading_balance: 'Loading balance...',
    transfer_balance_unavailable: 'Balance unavailable',
    transfer_insufficient: 'Insufficient balance. Short by',
    transfer_same_wallet: 'Source and destination wallet cannot be the same',
    transfer_save_changes: 'Save Changes',
    transfer_submit: 'Transfer',

    // Categories
    cat_title: 'Categories',
    cat_add: 'Add',
    cat_empty: 'No categories yet',
    cat_name: 'Category Name',
    cat_type: 'Type',
    cat_color: 'Color',
    cat_icon: 'Icon',
    cat_default: 'Default',
    cat_added: 'Category added',
    cat_updated: 'Category updated',
    cat_deleted: 'Category deleted',
    cat_delete_fail: 'Failed to delete',
    cat_modal_add: 'Add Category',
    cat_modal_edit: 'Edit Category',
    cat_delete_confirm: (name: string) => `Delete category "${name}"?`,

    // Templates
    tpl_title: 'Templates',
    tpl_add: 'Add',
    tpl_empty: 'No templates yet',
    tpl_empty_sub: 'Create templates to speed up transaction input',
    tpl_name: 'Template Name',
    tpl_type: 'Type',
    tpl_amount: 'Amount',
    tpl_category: 'Category',
    tpl_note: 'Note',
    tpl_added: 'Template added',
    tpl_updated: 'Template updated',
    tpl_deleted: 'Template deleted',
    tpl_add_fail: 'Failed to add',
    tpl_update_fail: 'Failed to update',
    tpl_delete_fail: 'Failed to delete',
    tpl_delete_confirm: 'Delete this template?',
    tpl_modal_add: 'Add Template',
    tpl_modal_edit: 'Edit Template',

    // Reports
    report_title: 'Reports',
    report_subtitle: 'Monthly financial analysis',
    report_total_income: 'Total Income',
    report_total_expense: 'Total Expense',
    report_balance: 'Net Balance',
    report_chart_daily: 'Daily Income vs Expense',
    report_chart_category: 'Expense by Category',
    report_all_tx: 'All Transactions',
    report_no_data: 'No data yet',
    report_no_expense: 'No expenses yet',
    report_no_tx: 'No transactions this month',
    report_col_date: 'Date',
    report_col_type: 'Type',
    report_col_category: 'Category',
    report_col_note: 'Note',
    report_col_amount: 'Amount',

    // Profile
    profile_title: 'Profile',
    profile_subtitle: 'Manage your account information',
    profile_joined: 'Joined',
    profile_full_name: 'Full Name',
    profile_email: 'Email',
    profile_change_password: 'Change Password',
    profile_old_password: 'Current Password',
    profile_new_password: 'New Password',
    profile_confirm_password: 'Confirm New Password',
    profile_save_password: 'Change Password',
    profile_saving: 'Saving...',
    profile_name_updated: 'Name updated successfully',
    profile_name_fail: 'Failed to update name',
    profile_pw_updated: 'Password changed successfully',
    profile_pw_mismatch: 'Password confirmation does not match',
    profile_pw_short: 'Password must be at least 6 characters',

    // Notifications
    notif_title: 'Notifications',
    notif_new: 'new',
    notif_delete_all: 'Delete all',
    notif_loading: 'Loading...',
    notif_empty: 'No notifications',

    // Months
    months: ['January','February','March','April','May','June','July','August','September','October','November','December'],

    // Common
    common_income: 'Income',
    common_expense: 'Expense',
    common_transfer: 'Transfer',
    common_cash: 'Cash',
    common_bank: 'Bank/E-Wallet',
    common_no_data: 'No data yet',
  },
} as const;

type TranslationKey = keyof typeof translations.id;

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey, ...args: string[]) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'id',
  setLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('id');

  function t(key: TranslationKey, ...args: string[]): string {
    const val = translations[locale][key];
    if (typeof val === 'function') return (val as (a: string) => string)(args[0] ?? '');
    if (Array.isArray(val)) return val.join(',');
    return val as string;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() { return useContext(I18nContext); }

/** Helper: ambil array months dari locale aktif */
export function useMonths(): string[] {
  const { locale } = useI18n();
  return translations[locale].months as unknown as string[];
}
