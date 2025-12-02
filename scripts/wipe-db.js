const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lladafzansibpzcpsxsl.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsYWRhZnphbnNpYnB6Y3BzeHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Mjk2OTksImV4cCI6MjA3OTAwNTY5OX0.2rx587CJxJZZwuXmfsMS_gFKWlK8vqnQKI_8licog-c';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function wipeTransactions() {
    console.log("Wiping all transactions...");

    const { error } = await supabase
        .from('transactions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows where ID is not empty (basically all)

    if (error) {
        console.error("Error wiping transactions:", error);
    } else {
        console.log("All transactions deleted successfully. Balance is now 0.");
    }
}

wipeTransactions();
