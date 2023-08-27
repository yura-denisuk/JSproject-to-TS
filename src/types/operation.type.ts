export type OperationType = {
    id: number,
    user_id: number,
    category_expense_id?: number,
    category_income_id?: number,
    type: string,
    amount: number,
    date: string,
    comment: string,
}