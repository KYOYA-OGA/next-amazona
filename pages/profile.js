import {
  Button,
  Card,
  Grid,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@material-ui/core'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import React, { useEffect, useContext } from 'react'
import NextLink from 'next/link'
import axios from 'axios'

import Layout from '../components/Layout'
import { Store } from '../utils/Store'
import useStyles from '../utils/styles'
import { getError } from '../utils/error'
import { Controller, useForm } from 'react-hook-form'
import { useSnackbar } from 'notistack'
import Cookies from 'js-cookie'

const Profile = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm()
  const classes = useStyles()
  const { state, dispatch } = useContext(Store)
  const { userInfo } = state
  const router = useRouter()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  useEffect(() => {
    if (!userInfo) router.push('/login')

    setValue('name', userInfo.name)
    setValue('email', userInfo.email)
  }, [])

  const submitHandler = async ({ name, email, password, confirmPassword }) => {
    closeSnackbar()
    if (password !== confirmPassword) {
      enqueueSnackbar('Passwords do not match', { variant: 'error' })
      return
    }
    try {
      const { data } = await axios.put(
        `/api/users/profile`,
        {
          name,
          email,
          password,
        },
        { headers: { authorization: `Bearer ${userInfo.token}` } }
      )
      dispatch({ type: 'USER_LOGIN', payload: data })
      Cookies.set('userInfo', data)
      enqueueSnackbar('Profile updated successfully', { variant: 'success' })
    } catch (err) {
      enqueueSnackbar(getError(err), { variant: 'error' })
    }
  }

  return (
    <Layout title="Profile">
      <Grid container spacing={1}>
        {/* sidebar */}
        <Grid item xs={12} md={3}>
          <Card className={classes.section}>
            <List>
              <NextLink href="/profile" passHref>
                <ListItem selected button component="a">
                  <ListItemText primary="User Profile"></ListItemText>
                </ListItem>
              </NextLink>
              <NextLink href="/profile" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Order History"></ListItemText>
                </ListItem>
              </NextLink>
            </List>
          </Card>
        </Grid>
        {/* content */}
        <Grid item xs={12} md={9}>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component="h1" variant="h1">
                  Profile
                </Typography>
              </ListItem>
              <ListItem>
                <form
                  onSubmit={handleSubmit(submitHandler)}
                  className={classes.form}
                >
                  <List>
                    <ListItem>
                      <Controller
                        name="name"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                          minLength: 1,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="name"
                            label="Name"
                            inputProps={{ type: 'text' }}
                            error={Boolean(errors.name)}
                            helperText={
                              errors.name
                                ? errors.name.type === 'minLength'
                                  ? 'Name length is more than 1'
                                  : 'Name is required'
                                : ''
                            }
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="email"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                          pattern:
                            /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,8}$/,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="email"
                            label="Email"
                            inputProps={{ type: 'email' }}
                            error={Boolean(errors.email)}
                            helperText={
                              errors.email
                                ? errors.email.type === 'pattern'
                                  ? 'Email is not valid'
                                  : 'Email is required'
                                : ''
                            }
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="password"
                        control={control}
                        defaultValue=""
                        rules={{
                          validate: (value) =>
                            value === '' ||
                            value.length > 5 ||
                            'Password length must be more than 5',
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="password"
                            label="Password"
                            inputProps={{ type: 'password' }}
                            error={Boolean(errors.password)}
                            helperText={
                              errors.password
                                ? 'Password length is more than 5'
                                : ''
                            }
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="confirmPassword"
                        control={control}
                        defaultValue=""
                        rules={{
                          validate: (value) =>
                            value === '' ||
                            value.length > 5 ||
                            'Password length must be more than 5',
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="confirmPassword"
                            label="Confirm Password"
                            inputProps={{ type: 'password' }}
                            error={Boolean(errors.confirmPassword)}
                            helperText={
                              errors.password
                                ? 'Confirm password length is more than 5'
                                : ''
                            }
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      <Button
                        variant="contained"
                        type="submit"
                        fullWidth
                        color="primary"
                      >
                        Update
                      </Button>
                    </ListItem>
                  </List>
                </form>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  )
}

export default dynamic(() => Promise.resolve(Profile), { ssr: false })
