export function getInvoiceDate(transactionDate: Date): Date {
    const date = new Date(transactionDate);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    // Best day is 4th.
    // If purchase is before 4th, it belongs to current month's invoice (due ~10th).
    // If purchase is on or after 4th, it belongs to next month's invoice (due ~10th next month).

    let invoiceMonth = month;
    let invoiceYear = year;

    if (day >= 4) {
        invoiceMonth++;
        if (invoiceMonth > 11) {
            invoiceMonth = 0;
            invoiceYear++;
        }
    }

    // Assuming due date is 10th
    return new Date(invoiceYear, invoiceMonth, 10);
}

export function isCreditCardExpense(transaction: any): boolean {
    return transaction.type === 'expense' && transaction.paymentMethod === 'credit';
}
