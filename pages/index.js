/* eslint-disable @next/next/no-img-element */
import { Grid, Link, Typography } from '@material-ui/core'
import Carousel from 'react-material-ui-carousel'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useContext } from 'react'
import axios from 'axios'

import Layout from '../components/Layout'
import db from '../utils/db'
import Product from '../models/Product'
import { Store } from '../utils/Store'
import ProductItem from '../components/ProductItem'
import useStyles from '../utils/styles'

export default function Home({ topRatedProducts, featuredProducts }) {
  const classes = useStyles()
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
      <Carousel className={classes.carousel} animation="slide">
        {featuredProducts.map((item) => (
          <NextLink key={item._id} href={`/product/${item.slug}`} passHref>
            <Link>
              <img
                src={item.featuredImage}
                alt={item.name}
                className={classes.featuredImage}
              />
            </Link>
          </NextLink>
        ))}
      </Carousel>
      <Typography variant="h2">Popular Products</Typography>
      <Grid container spacing={3}>
        {topRatedProducts.map((product) => (
          <Grid item sm={6} md={4} key={product.name}>
            <ProductItem
              product={product}
              addToCartHandler={addToCartHandler}
            />
          </Grid>
        ))}
      </Grid>
    </Layout>
  )
}

export const getServerSideProps = async () => {
  await db.connect()
  const featuredProductsDocs = await Product.find(
    { isFeatured: true },
    '-reviews'
  )
    .lean()
    .limit(3)
  const topRatedProductsDocs = await Product.find({}, '-reviews')
    .lean()
    .sort({ rating: -1 })
    .limit(6)
  await db.disconnect()

  return {
    props: {
      featuredProducts: featuredProductsDocs.map(db.convertDocToObj),
      topRatedProducts: topRatedProductsDocs.map(db.convertDocToObj),
    },
  }
}
