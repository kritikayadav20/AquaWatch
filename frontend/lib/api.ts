const API_BASE_URL = 'http://localhost:8000/api';

export type Coupon = {
    id: string;
    code: string;
    points_used: number;
    value_rupees: number;
    status: 'active' | 'redeemed' | 'expired';
    created_at: string;
};

export type Park = {
    id: string;
    name: string;
    city: string;
    state: string;
    ticket_price: number;
    description: string;
};

export type Ticket = {
    id: string;
    park_name: string;
    ticket_status: string;
    coupon_code: string;
    issued_at: string;
};

export async function redeemPoints(userId: string, points: number): Promise<Coupon> {
    const response = await fetch(`${API_BASE_URL}/coupons/redeem`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: userId,
            points_to_redeem: points,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to redeem points');
    }

    return response.json();
}

export async function getMyCoupons(userId: string): Promise<Coupon[]> {
    const response = await fetch(`${API_BASE_URL}/coupons/my-coupons/${userId}`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch coupons');
    }

    return response.json();
}



export async function getParks(): Promise<Park[]> {
    const response = await fetch(`${API_BASE_URL}/coupons/parks`, {
        method: 'GET',
    });
    if (!response.ok) throw new Error('Failed to fetch parks');
    return response.json();
}

export async function redeemParkTicket(userId: string, parkId: string, couponCode: string): Promise<Ticket> {
    const response = await fetch(`${API_BASE_URL}/coupons/parks/redeem-ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, park_id: parkId, coupon_code: couponCode }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ticket redemption failed');
    }
    return response.json();
}
