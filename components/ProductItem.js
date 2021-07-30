import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from '@material-ui/core'
import React from 'react'
import NextLink from 'next/link'
import { Rating } from '@material-ui/lab'
import useStyles from '../utils/styles'

const ProductItem = ({ product, addToCartHandler }) => {
  const classes = useStyles()

  return (
    <Card>
      <NextLink href={`/product/${product.slug}`}>
        <CardActionArea>
          <CardMedia
            component="img"
            image={product.image}
            title={product.name}
            className={classes.topImage}
          />
          <CardContent>
            <Typography>{product.name}</Typography>
            <Rating value={product.rating} readOnly></Rating>
          </CardContent>
        </CardActionArea>
      </NextLink>
      <CardActions>
        <Typography>${product.price}</Typography>
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={() => addToCartHandler(product)}
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  )
}

export default ProductItem
