export type ChartType = {
    type: string,
    data: {
        datasets: Datasets[],
        labels: string[]
    }[],
    options: {
        responsive: boolean
    }
}

type Datasets = {
    data: number[],
    background: string[]
}