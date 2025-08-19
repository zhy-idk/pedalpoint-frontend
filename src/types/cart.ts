export interface Cart {
    items: {
        product_variant: {
            id: number;
            name: string;
            sku?: string;
            price: string;
            stock: number;
            product:{
                id: number;
                name: string;
                image: string;
                slug: string;
            }
        };
    }[];
    created_at: string;
    updated_at: string;
}