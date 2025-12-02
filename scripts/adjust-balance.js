const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://lladafzansibpzcpsxsl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsYWRhZnphbnNpYnB6Y3BzeHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Mjk2OTksImV4cCI6MjA3OTAwNTY5OX0.2rx587CJxJZZwuXmfsMS_gFKWlK8vqnQKI_8licog-c';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function adjustBalance() {
    console.log("Calculating current balance...");

    // Get all transactions until now
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select('amount, type')
        .lte('date', new Date().toISOString());

    if (error) {
        console.error("Error fetching transactions:", error);
        return;
    }

    const currentBalance = transactions.reduce((acc, t) => {
        return t.type === 'income' ? acc + Number(t.amount) : acc - Number(t.amount);
    }, 0);

    console.log(`Current Balance: R$ ${currentBalance.toFixed(2)}`);

    const targetBalance = 200.00;
    const diff = targetBalance - currentBalance;

    if (Math.abs(diff) < 0.01) {
        console.log("Balance is already correct.");
        return;
    }

    const type = diff > 0 ? 'income' : 'expense';
    const amount = Math.abs(diff);

    console.log(`Adjusting by ${diff > 0 ? '+' : '-'} R$ ${amount.toFixed(2)}...`);

    const { error: insertError } = await supabase
        .from('transactions')
        .insert({
            amount: amount,
            description: "Ajuste Manual de Suporte (R$ 200,00)",
            date: new Date().toISOString(),
            type: type,
            category: 'other',
            payment_method: 'debit',
            is_recurring: false
        });

    if (insertError) {
        console.error("Error inserting adjustment:", insertError);
    } else {
        console.log("Balance adjusted successfully to R$ 200.00!");
    }
}

adjustBalance();
