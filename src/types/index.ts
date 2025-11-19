export type TransactionType = 'income' | 'expense';

export type Category =
    | 'food'
    | 'transport'
    | 'housing'
    | 'utilities'
    | 'health'
    | 'entertainment'
    | 'salary'
    | 'freelance'
    | 'investment'
    | 'other';

export interface Transaction {
    id: string;
    amount: number;
    description: string;
    date: string; // ISO string
    type: TransactionType;
    category: Category;
    paymentMethod: 'debit' | 'credit';
    installments?: number; // For future use
    isRecurring?: boolean;
    recurrenceDay?: number; // 1-31
}

export interface EmergencyFund {
    currentAmount: number;
    goalAmount: number;
    monthlyContribution: number;
}

export interface AppData {
    transactions: Transaction[];
    emergencyFund: EmergencyFund;
}
