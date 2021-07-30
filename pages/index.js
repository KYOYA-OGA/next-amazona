import { Grid } from '@material-ui/core'
import Layout from '../components/Layout'
import db from '../utils/db'
import Product from '../models/Product'
import { useRouter } from 'next/router'
import { useContext } from 'react'
import { Store } from '../utils/Store'
import axios from 'axios'
import ProductItem from '../components/ProductItem'

export default function Home({ products }) {
  const { state, dispatch } = useContext(Store)
  const router = useRouter()
  const addToCartHandler = async (product) => {
    const { data } = await axios.get(`/api/products/${product._id}`)
    const existItem = state.cart.cartItems.find(
      (item) => item._id === product._id
    )
    const quantity = existItem ? existItem.quantity + 1 : 1
    if (data.countInStock < quantity) {
      window.alert('Sorry, Product is out of stock')
      return
    }
    dispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...product, quantity },
    })
    router.push('/cart')
  }
  return (
    <Layout>
      <div>
        <h1>Products</h1>
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item md={4} key={product.name}>
              <ProductItem
                product={product}
                addToCartHandler={addToCartHandler}
              />
            </Grid>
          ))}
        </Grid>
      </div>
    </Layout>
  )
}

export const getServerSideProps = async () => {
  await db.connect()
  const products = await Product.find({}, '-reviews').lean()
  await db.disconnect()

  return {
    props: {
      products: products.map(db.convertDocToObj),
    },
  }
}
