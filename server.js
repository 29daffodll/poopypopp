import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import Stripe from 'stripe'

dotenv.config()

const app = express()
const port = Number(process.env.PORT || 5175)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  console.error('Missing STRIPE_SECRET_KEY in environment. Set STRIPE_SECRET_KEY in .env or your environment.')
}

const stripe = new Stripe(stripeSecretKey || '')

const allowedOrigins = [
  process.env.FRONTEND_URL || process.env.VITE_APP_URL || 'http://localhost:5174',
  'http://localhost:5173',
  'http://127.0.0.1:5174'
]

app.use(cors({ origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true }))
app.use(express.json())

app.post('/create-checkout-session', async (req, res) => {
  const { bookingId, amount, currency = 'php', description = 'Hotel booking payment' } = req.body || {}

  if (!bookingId) {
    return res.status(400).json({ error: 'Missing bookingId in request body.' })
  }

  if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Missing or invalid amount in request body.' })
  }

  if (!stripeSecretKey) {
    return res.status(500).json({ error: 'Stripe secret key is not configured on the server.' })
  }

  try {
    const successUrl =
      process.env.STRIPE_SUCCESS_URL || 'http://localhost:5173/?payment=success'
    const cancelUrl =
      process.env.STRIPE_CANCEL_URL || 'http://localhost:5173/?payment=cancel'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Hotel booking #${bookingId}`,
              description
            },
            unit_amount: Math.round(amount * 100)
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        bookingId: String(bookingId)
      }
    })

    return res.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return res.status(500).json({ error: error.message || 'Unable to create Stripe checkout session.' })
  }
})

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Stripe server is running.' })
})

app.listen(port, () => {
  console.log(`Stripe backend server listening on http://localhost:${port}`)
})
