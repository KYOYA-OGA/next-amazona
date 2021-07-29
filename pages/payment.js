import Cookies from 'js-cookie'
import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Store } from '../utils/Store'

import Layout from '../components/Layout'
import CheckoutWizard from '../components/CheckoutWizard'
import useStyles from '../utils/styles'
import {
  Button,
  FormControl,
  List,
  ListItem,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@material-ui/core'
import { useSnackbar } from 'notistack'

const Payment = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const classes = useStyles()
  const { state, dispatch } = useContext(Store)
  const {
    cart: { shippingAddress },
  } = state
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState('')

  useEffect(() => {
    if (!shippingAddress.address) {
      router.push('/shipping')
    } else {
      setPaymentMethod(Cookies.get('paymentMethod' || ''))
    }
  }, [])

  const submitHandler = (e) => {
    e.preventDefault()
    if (!paymentMethod) {
      enqueueSnackbar('Please select a payment method', { variant: 'error' })
      return
    }
    dispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethod })
    Cookies.set('paymentMethod', paymentMethod)
    router.push('/placeorder')
  }
  return (
    <Layout title="Payment Method">
      <CheckoutWizard activeStep={2} />
      <form className={classes.form} onSubmit={submitHandler}>
        <Typography component="h1" variant="h1">
          Payment Method
        </Typography>
        <List>
          <ListItem>
            <FormControl>
              <RadioGroup
                aria-label="Payment Method"
                name="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel
                  label="PayPal"
                  value="PayPal"
                  control={<Radio />}
                ></FormControlLabel>
                <FormControlLabel
                  label="Stripe"
                  value="Stripe"
                  control={<Radio />}
                ></FormControlLabel>
                <FormControlLabel
                  label="Cash"
                  value="Cash"
                  control={<Radio />}
                ></FormControlLabel>
              </RadioGroup>
            </FormControl>
          </ListItem>
          <ListItem>
            <Button fullWidth type="submit" variant="contained" color="primary">
              Continue
            </Button>
          </ListItem>
          <ListItem>
            <Button
              fullWidth
              type="button"
              variant="contained"
              onClick={() => router.push('/shipping')}
            >
              Back
            </Button>
          </ListItem>
        </List>
      </form>
    </Layout>
  )
}

export default Payment
