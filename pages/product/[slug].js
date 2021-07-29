import Layout from '../../components/Layout';
import NextLink from 'next/link';
import Image from 'next/image';
import useStyles from '../../utils/styles';
import {
  Card,
  Grid,
  Link,
  List,
  ListItem,
  Typography,
  Button,
  TextField,
  CircularProgress,
} from '@material-ui/core';
import { Rating } from '@material-ui/lab';
import db from '../../utils/db';
import Product from '../../models/Product';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Store } from '../../utils/Store';
import { getError } from '../../utils/error';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';

const ProductScreen = ({ product }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { userInfo } = state;
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/products/${product._id}/reviews`);
      setReviews(data);
    } catch (err) {
      enqueueSnackbar(getError(err), { variant: 'error' });
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `/api/products/${product._id}/reviews`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      setLoading(false);
      enqueueSnackbar('Review submitted successfully', { variant: 'success' });
      fetchReviews();
    } catch (err) {
      setLoading(false);
      enqueueSnackbar(getError(err), { variant: 'error' });
    }
  };

  const addToCartHandler = async () => {
    const { data } = await axios.get(`/api/products/${product._id}`);
    const existItem = state.cart.cartItems.find(
      (item) => item._id === product._id
    );
    const quantity = existItem ? existItem.quantity + 1 : 1;
    if (data.countInStock < quantity) {
      window.alert('Sorry, Product is out of stock');
      return;
    }
    dispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...product, quantity },
    });
    router.push('/cart');
  };

  if (!product) {
    return <div>Product Not Found</div>;
  }

  return (
    <Layout title={product.name} description={product.description}>
      <div className={classes.section}>
        <NextLink href="/" passHref>
          <Link>Back to products</Link>
        </NextLink>
      </div>
      <Grid container spacing={1}>
        <Grid item md={6} xs={12}>
          <Image
            src={product.image}
            alt={product.name}
            height={640}
            width={640}
            layout="responsive"
          />
        </Grid>
        <Grid item md={3} xs={12}>
          <List>
            <ListItem>
              <Typography component="h1" variant="h1">
                {product.name}
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>Category: {product.category}</Typography>
            </ListItem>
            <ListItem>
              <Typography>Brand: {product.brand}</Typography>
            </ListItem>
            <ListItem>
              <Rating value={product.rating} readOnly></Rating>
              <NextLink href="#reviews" passHref>
                <Link>
                  <Typography>({product.numReviews} reviews)</Typography>
                </Link>
              </NextLink>
            </ListItem>
            <ListItem>
              Description:
              <Typography>{product.description}</Typography>
            </ListItem>
          </List>
        </Grid>
        <Grid item md={3} xs={12}>
          <Card>
            <List>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Price</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>${product.price}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Status</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      ${product.countInStock > 0 ? 'In stock' : 'Unavailable'}
                    </Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={addToCartHandler}
                >
                  Add to cart
                </Button>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
      <List>
        <ListItem>
          <Typography name="reviews" id="reviews" variant="h2">
            Customer Reviews
          </Typography>
        </ListItem>
        {reviews.length === 0 && <ListItem>No review</ListItem>}
        {reviews.map((review) => (
          <ListItem key={review._id}>
            <Grid container>
              <Grid item className={classes.reviewItem}>
                <Typography>
                  <strong>{review.name}</strong>
                </Typography>
                <Typography>{review.createdAt.substring(0, 10)}</Typography>
              </Grid>
              <Grid item className={classes.reviewItem}>
                <Rating value={review.rating} readOnly />
                <Typography>{review.comment}</Typography>
              </Grid>
            </Grid>
          </ListItem>
        ))}
        <ListItem>
          {userInfo ? (
            <form onSubmit={submitHandler} className={classes.reviewForm}>
              <List>
                <ListItem>
                  <Typography variant="h2">Leave your review</Typography>
                </ListItem>
                <ListItem>
                  <TextField
                    multiline
                    variant="outlined"
                    fullWidth
                    name="review"
                    label="Enter comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </ListItem>
                <ListItem>
                  <Rating
                    name="simple-controlled"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  />
                </ListItem>
                <ListItem>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                  >
                    Submit
                  </Button>
                  {loading && <CircularProgress />}
                </ListItem>
              </List>
            </form>
          ) : (
            <Typography variant="h2">
              Please{' '}
              <NextLink
                href={`/login?redirect=/product/${product.slug}`}
                passHref
              >
                <Link>login</Link>
              </NextLink>{' '}
              to write a review
            </Typography>
          )}
        </ListItem>
      </List>
    </Layout>
  );
};

export default ProductScreen;

export const getServerSideProps = async (context) => {
  const { params } = context;
  const { slug } = params;
  await db.connect();
  const product = await Product.findOne({ slug }, '-reviews').lean();
  await db.disconnect();

  return {
    props: {
      product: db.convertDocToObj(product),
    },
  };
};
