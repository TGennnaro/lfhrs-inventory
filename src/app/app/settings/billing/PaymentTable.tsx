import { Payment } from '@prisma/client';
import { stripe } from '@lib/stripe';
import { capitalize } from '@lib/utils';
import PaymentTableData from './PaymentTableData';

export default async function PaymentTable({
	payments,
}: {
	payments: Payment[];
}) {
	const populatedPayments = await Promise.all(
		payments.map(async (payment) => {
			const stripeData = await stripe.invoices.retrieve(payment.id);
			return {
				id: payment.id,
				amount: stripeData.amount_paid,
				status: capitalize(stripeData.status as string),
				created: stripeData.created,
			};
		})
	);
	return <PaymentTableData payments={populatedPayments} />;
}
