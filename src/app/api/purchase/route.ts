// import { Stripe } from "@stripe/stripe-js";

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// const params: Stripe.Checkout.SessionCreateParams = {
// 	payment_method_types: ["card"],
// 	submit_type: "pay",
// 	line_items: [
// 		{
// 			name: "Manager Package",
// 			amount: formatAmountForStripe(399, CURRENCY),
// 		}
// 	]

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: '2022-11-15',
});

export async function POST(req: Request, res: Response) {
	const body = await req.json();
	const plan: string = body.plan;
	const planCapitalized = plan.charAt(0).toUpperCase() + plan.slice(1);
	try {
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			mode: 'subscription',
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: {
							name: `${planCapitalized} Package Subscription`,
						},
						unit_amount: 1999,
						recurring: {
							interval: 'month',
						},
					},
					quantity: 1,
				},
				{
					price_data: {
						currency: 'usd',
						product_data: {
							name: `${planCapitalized} Package Startup Fee`,
						},
						unit_amount: 28000,
					},
					quantity: 1,
				},
			],
			success_url: `${req.headers.get(
				'origin'
			)}/purchase/{CHECKOUT_SESSION_ID}`,
			cancel_url: `${req.headers.get('origin')}/plans`,
		});
		return NextResponse.json(session, { status: 200 });
	} catch (err) {
		const message =
			err instanceof Error ? err.message : 'Internal server error';
		return NextResponse.json({ message }, { status: 500 });
	}
}
