export interface Chain {
    id: number
    name: string
    nativeCurrency: {
        decimals: number,
        name: string,
        symbol: string,
    },
    rpcUrl: string,
}

export interface Connector {
    id: string
    name: string
    type: string
}
