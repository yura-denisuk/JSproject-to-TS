export class ChangeDate {
    public static ChangeDateFormat(date: HTMLInputElement): string {
        const dateArray: string[] = date.value.split('.').reverse();
        return dateArray.join('-');
    }

    public static ChangeDateFormatFilter(date: string): string {
        const dateArray: string[] = date.split('.').reverse();
        return dateArray.join('-');
    }
}