import { toDateTime } from '@lib/date';
import { db } from '@lib/prisma';
import { stripe } from '@lib/stripe';
import { getUserFromCustomer } from '@lib/stripe-util';
import { Tier } from '@prisma/client';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const relevantEvents = new Set([
	'checkout.session.completed',
	'customer.subscription.created',
	'customer.subscription.deleted',
	'customer.subscription.updated',
	'invoice.paid',
]);

export async function POST(req: Request) {
	const body = await req.text();
	const signature = req.headers.get('stripe-signature');
	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(
			body,
			signature!,
			process.env.STRIPE_WEBHOOK_SECRET!
		);
	} catch (err) {
		console.log('Invalid signature', err);
		return new NextResponse('Invalid signature', { status: 400 });
	}

	// Handle the event
	if (relevantEvents.has(event.type)) {
		try {
			switch (event.type) {
				case 'checkout.session.completed':
					// const session = event.data.object as Stripe.Checkout.Session;
					// handlePaymentReceived(session.id, session.customer as string);
					// Send email/receipt/notification in the future
					break;
				case 'customer.subscription.created':
				case 'customer.subscription.updated':
				case 'customer.subscription.deleted':
					// Upsert the subscription data from database
					const subscription = event.data.object as Stripe.Subscription;
					handleSubscriptionChange(
						subscription.id,
						subscription.customer as string
					);
					break;
				case 'invoice.paid':
					const invoice = event.data.object as Stripe.Invoice;
					handlePaymentReceived(invoice.id, invoice.customer as string);
					break;
				default:
					throw new Error('Unhandled relevant hook event.');
			}
		} catch (err) {
			console.log(err);
			return new NextResponse('Webhook handler error', { status: 500 });
		}
		return new NextResponse('Success', { status: 200 });
	}
	return new NextResponse('Received', { status: 200 });
}

async function handleSubscriptionChange(
	subscriptionId: string,
	customerId: string
) {
	const user = await getUserFromCustomer(customerId);
	const subscription = await stripe.subscriptions.retrieve(subscriptionId);
	if (!subscription) throw new Error('Subscription not found');
	const subscriptionData = {
		id: subscription.id,
		status: subscription.status,
		tier: subscription.metadata.plan as Tier,
		cancel_at_period_end: subscription.cancel_at_period_end,
		current_period_start: toDateTime(subscription.current_period_start),
		current_period_end: toDateTime(subscription.current_period_end),
		created: toDateTime(subscription.created),
		ended_at: toDateTime(subscription.ended_at),
	};
	await db.subscription.upsert({
		where: {
			id: subscription.id,
		},
		create: {
			...subscriptionData,
			user: {
				connect: {
					id: user.id,
				},
			},
		},
		update: {
			...subscriptionData,
		},
	});
}

async function handlePaymentReceived(paymentId: string, customerId: string) {
	const user = await getUserFromCustomer(customerId);
	await db.payment.create({
		data: {
			id: paymentId,
			user: {
				connect: {
					id: user.id,
				},
			},
		},
	});
}

/*

checkout.session.completed
- metadata.plan
- metadata.user
- customer
- status

customer.subscription.created
- 

*/
