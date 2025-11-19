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
    getData: async (): Promise<AppData> => {
        const { data: transactions } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });

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
