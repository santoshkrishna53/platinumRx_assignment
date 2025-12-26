export type Stats = {
    [gatewayId: string]: StatsType
}

export type StatsType = {
    total: number;
    orders: orders[];
    unhealthyUntil: number | null;
    failures: number;
}

export type orders = {
    orderid: string;
    status: 'success' | 'failure';
    timestamp: number;
}