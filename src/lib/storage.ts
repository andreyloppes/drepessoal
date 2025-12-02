import { AppData, Transaction, EmergencyFund } from "@/types";
import { supabase } from "./supabase";

const DEFAULT_DATA: AppData = {
    transactions: [],
    emergencyFund: {
        currentAmount: 0,
        goalAmount: 10000,
        monthlyContribution: 500,
    },
};

export const StorageService = {
    getData: async (month?: Date): Promise<AppData> => {
        let query = supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });

        if (month) {
            // Create UTC dates to match how transactions are saved (YYYY-MM-DDT00:00:00.000Z)
            const start = new Date(Date.UTC(month.getFullYear(), month.getMonth(), 1)).toISOString();
            const end = new Date(Date.UTC(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999)).toISOString();
            query = query.gte('date', start).lte('date', end);
        }

        const { data: transactions } = await query;

        const { data: fund } = await supabase
            .from('emergency_fund')
            .select('*')
            .single();

        return {
            transactions: (transactions as any[])?.map(t => ({
                ...t,
                paymentMethod: t.payment_method,
                isRecurring: t.is_recurring,
                recurrenceDay: t.recurrence_day
            })) || [],
            emergencyFund: fund ? {
                currentAmount: fund.current_amount,
                goalAmount: fund.goal_amount,
                monthlyContribution: fund.monthly_contribution
            } : DEFAULT_DATA.emergencyFund
        };
    },

    getTotalBalanceUntil: async (date: Date) => {
        const end = new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)).toISOString();

        const { data } = await supabase
            .from('transactions')
            .select('amount, type')
            .lte('date', end);

        if (!data) return 0;

        return data.reduce((acc, t) => {
            return t.type === 'income' ? acc + Number(t.amount) : acc - Number(t.amount);
        }, 0);
    },

    getCurrentBalance: async () => {
        const now = new Date().toISOString();

        const { data } = await supabase
            .from('transactions')
            .select('amount, type')
            .lte('date', now);

        if (!data) return 0;

        return data.reduce((acc, t) => {
            return t.type === 'income' ? acc + Number(t.amount) : acc - Number(t.amount);
        }, 0);
    },

    addTransaction: async (transaction: Transaction) => {
        const { data, error } = await supabase
            .from('transactions')
            .insert({
                id: transaction.id,
                amount: transaction.amount,
                description: transaction.description,
                date: transaction.date,
                type: transaction.type,
                category: transaction.category,
                payment_method: transaction.paymentMethod,
                is_recurring: transaction.isRecurring,
                recurrence_day: transaction.recurrenceDay
            })
            .select();

        if (error) console.error('Error adding transaction:', error);
        return data;
    },

    deleteTransaction: async (id: string) => {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) console.error('Error deleting transaction:', error);
    },

    updateTransaction: async (transaction: Transaction) => {
        const { error } = await supabase
            .from('transactions')
            .update({
                amount: transaction.amount,
                description: transaction.description,
                date: transaction.date,
                type: transaction.type,
                category: transaction.category,
                payment_method: transaction.paymentMethod,
                is_recurring: transaction.isRecurring,
                recurrence_day: transaction.recurrenceDay
            })
            .eq('id', transaction.id);

        if (error) console.error('Error updating transaction:', error);
    },

    updateEmergencyFund: async (fund: Partial<EmergencyFund>) => {
        // We assume there's only one row for now
        // First get the ID (or we could hardcode it if we knew it)
        const { data: existing } = await supabase.from('emergency_fund').select('id').single();

        if (existing) {
            const updateData: any = {};
            if (fund.currentAmount !== undefined) updateData.current_amount = fund.currentAmount;
            if (fund.goalAmount !== undefined) updateData.goal_amount = fund.goalAmount;
            if (fund.monthlyContribution !== undefined) updateData.monthly_contribution = fund.monthlyContribution;

            const { error } = await supabase
                .from('emergency_fund')
                .update(updateData)
                .eq('id', existing.id);

            if (error) console.error('Error updating fund:', error);
        }
    },
};
